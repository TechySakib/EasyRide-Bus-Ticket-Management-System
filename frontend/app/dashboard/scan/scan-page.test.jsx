/**
 * @file scan-page.test.jsx
 * @description Comprehensive test suite for the ScanPage component.
 * Tests include role-based rendering (Admin/Conductor vs Passenger),
 * QR scanning logic, API interactions, and modal behavior.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ScanPage from './page'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserRole, ROLES } from '@/lib/roles'
import '@testing-library/jest-dom'

// --- Mocks ---

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// Mock @/lib/supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
        },
        from: jest.fn(),
    },
}))

// Mock @/lib/roles
jest.mock('@/lib/roles', () => ({
    getUserRole: jest.fn(),
    ROLES: {
        ADMIN: 'admin',
        CONDUCTOR: 'conductor',
        PASSENGER: 'passenger',
    },
}))

// Mock @/components/admin/QRScanner
// Renders a button to simulate a scan event
jest.mock('@/components/admin/QRScanner', () => {
    return function MockQRScanner({ onScan }) {
        return (
            <button
                data-testid="mock-scanner-trigger"
                onClick={() => onScan('valid-qr-code-123')}
            >
                Simulate Scan
            </button>
        )
    }
})

// Mock qrcode.react to avoid canvas issues
jest.mock('qrcode.react', () => ({
    QRCodeSVG: () => <div data-testid="mock-qrcode-svg">QR Code SVG</div>,
}))

// Mock DashboardHeader to simplify render tree
jest.mock('@/components/DashboardHeader', () => () => <div data-testid="dashboard-header">Dashboard Header</div>)

// Mock global fetch
global.fetch = jest.fn()

describe('ScanPage Component', () => {
    const mockRouter = { push: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        useRouter.mockReturnValue(mockRouter)

        // Default Supabase Session Mock
        supabase.auth.getSession.mockResolvedValue({
            data: {
                session: {
                    user: { id: 'test-user-id' },
                    access_token: 'test-token',
                },
            },
        })

        // Default Supabase DB Mock (Profile Fetch)
        // Chain: from -> select -> eq -> single
        const mockSingle = jest.fn().mockResolvedValue({ data: { role: 'passenger' } })
        const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
        supabase.from.mockReturnValue({ select: mockSelect })

        // Default getUserRole Mock
        getUserRole.mockReturnValue(ROLES.PASSENGER)

        // Default Fetch Mock (Success for log-access)
        global.fetch.mockImplementation((url) => {
            if (url.includes('/api/users/log-access')) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        })
    })

    /**
     * Test Scenario: Loading State
     * Verifies that the loading spinner appears initially while fetching user role.
     */
    test('renders loading spinner initially', async () => {
        // Delay the session response to keep it in loading state
        supabase.auth.getSession.mockReturnValue(new Promise(() => { }))

        render(<ScanPage />)

        // Look for the spinner container or class
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
    })

    describe('Admin/Conductor View (Scanner Logic)', () => {
        beforeEach(() => {
            // Setup role as ADMIN
            getUserRole.mockReturnValue(ROLES.ADMIN)

            // Setup Supabase profile return
            const mockSingle = jest.fn().mockResolvedValue({ data: { role: 'admin' } })
            const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
            supabase.from.mockReturnValue({ select: mockSelect })
        })

        /**
         * Test: Verify Scanner Renders
         * Checks if the QRScanner component is rendered for admins.
         */
        test('renders the scanner component for admin/conductor', async () => {
            await act(async () => {
                render(<ScanPage />)
            })

            expect(screen.getByText('Ticket Scanner')).toBeInTheDocument()
            expect(screen.getByTestId('mock-scanner-trigger')).toBeInTheDocument()
        })

        /**
         * Test: Success Case
         * Mocks a successful ticket validation API response.
         * Triggers the scanner mock and verifies the success card details.
         */
        test('displays success card with ticket details on valid scan', async () => {
            const mockTicket = {
                passenger_name: 'John Doe',
                route_name: 'Route 66',
                booking_date: '2023-10-27',
                departure_time: '10:00 AM',
                status: 'confirmed'
            }

            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/validate')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ ticket: mockTicket })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.reject(new Error('Unknown URL'))
            })

            await act(async () => {
                render(<ScanPage />)
            })

            // Trigger Scan
            const scanButton = screen.getByTestId('mock-scanner-trigger')
            await act(async () => {
                fireEvent.click(scanButton)
            })

            // Verify Success Card
            await waitFor(() => {
                expect(screen.getByText('Valid Ticket')).toBeInTheDocument()
                expect(screen.getByText('John Doe')).toBeInTheDocument()
                expect(screen.getByText('Route 66')).toBeInTheDocument()
                expect(screen.getByText('confirmed')).toBeInTheDocument()
            })
        })

        /**
         * Test: Error Case
         * Mocks a failed ticket validation API response (e.g., 400/404).
         * Triggers the scanner mock and verifies the error card.
         */
        test('displays error card on invalid scan', async () => {
            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/validate')) {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Ticket not found' })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.reject(new Error('Unknown URL'))
            })

            await act(async () => {
                render(<ScanPage />)
            })

            // Trigger Scan
            const scanButton = screen.getByTestId('mock-scanner-trigger')
            await act(async () => {
                fireEvent.click(scanButton)
            })

            // Verify Error Card
            await waitFor(() => {
                expect(screen.getByText('Invalid Ticket')).toBeInTheDocument()
                expect(screen.getByText('Ticket not found')).toBeInTheDocument()
            })
        })

        /**
         * Test: Reset Scanner
         * Verifies that clicking "Scan Next Ticket" attempts to reload the page.
         * Since window.location.reload is not implemented in JSDOM and hard to mock,
         * we verify that it triggers the JSDOM "Not implemented" error.
         */
        test('attempts to reload page when "Scan Next Ticket" is clicked', async () => {
            // Setup success state first
            const mockTicket = {
                passenger_name: 'John Doe',
                route_name: 'Route 66',
                booking_date: '2023-10-27',
                departure_time: '10:00 AM',
                status: 'confirmed'
            }

            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/validate')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ ticket: mockTicket })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.resolve({ ok: true })
            })

            await act(async () => {
                render(<ScanPage />)
            })

            // Trigger Scan
            await act(async () => {
                fireEvent.click(screen.getByTestId('mock-scanner-trigger'))
            })

            // Wait for success card
            await waitFor(() => {
                expect(screen.getByText('Scan Next Ticket')).toBeInTheDocument()
            })

            // Spy on console.error to catch JSDOM's "Not implemented" error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

            // Click Reset
            fireEvent.click(screen.getByText('Scan Next Ticket'))

            // Verify that console.error was called with the expected JSDOM error
            // JSDOM logs an Error object: "Error: Not implemented: navigation (except hash changes)"
            const errorArg = consoleSpy.mock.calls[0][0]
            // Check message directly to avoid cross-context Error constructor issues
            expect(errorArg).toBeTruthy()
            expect(errorArg.message).toContain('Not implemented: navigation')

            consoleSpy.mockRestore()
        })
    })

    describe('Passenger View (Booking Logic)', () => {
        beforeEach(() => {
            // Setup role as PASSENGER
            getUserRole.mockReturnValue(ROLES.PASSENGER)

            // Setup Supabase profile return
            const mockSingle = jest.fn().mockResolvedValue({ data: { role: 'passenger' } })
            const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
            const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
            supabase.from.mockReturnValue({ select: mockSelect })
        })

        /**
         * Test: Render Bookings List
         * Mocks fetch to return a list of bookings and verifies they render.
         */
        test('renders list of bookings correctly', async () => {
            const mockBookings = [
                {
                    id: 1,
                    booking_status: 'confirmed',
                    journey_date: '2023-11-01',
                    seat_number: 'A1',
                    easyride_bus_assignments: {
                        easyride_routes: { name: 'Dhaka to Chittagong' },
                        easyride_buses: { bus_number: 'BUS-101' }
                    },
                    easyride_qr_codes: { qr_code_data: 'qr-data-1' }
                },
                {
                    id: 2,
                    booking_status: 'pending',
                    journey_date: '2023-11-05',
                    seat_number: 'B2',
                    easyride_bus_assignments: {
                        easyride_routes: { name: 'Dhaka to Sylhet' },
                        easyride_buses: { bus_number: 'BUS-202' }
                    },
                    easyride_qr_codes: [{ qr_code_data: 'qr-data-2' }] // Test array format
                }
            ]

            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/my-bookings')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ bookings: mockBookings })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.resolve({ ok: true })
            })

            await act(async () => {
                render(<ScanPage />)
            })

            await waitFor(() => {
                expect(screen.getByText('Your Recent Bookings')).toBeInTheDocument()
                expect(screen.getByText('Dhaka to Chittagong')).toBeInTheDocument()
                expect(screen.getByText('Dhaka to Sylhet')).toBeInTheDocument()
                // Use regex to match partial text "Bus: BUS-101"
                expect(screen.getByText(/BUS-101/)).toBeInTheDocument()
                expect(screen.getByText(/BUS-202/)).toBeInTheDocument()
            })
        })

        /**
         * Test: Empty State
         * Verifies the "No recent bookings found" message when API returns empty array.
         */
        test('renders empty state message when no bookings found', async () => {
            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/my-bookings')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ bookings: [] })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.resolve({ ok: true })
            })

            await act(async () => {
                render(<ScanPage />)
            })

            await waitFor(() => {
                expect(screen.getByText('No recent bookings found.')).toBeInTheDocument()
            })
        })

        /**
         * Test: Modal Interaction
         * Verifies opening and closing the QR code modal.
         */
        test('opens and closes QR code modal', async () => {
            const mockBookings = [
                {
                    id: 1,
                    booking_status: 'confirmed',
                    journey_date: '2023-11-01',
                    seat_number: 'A1',
                    easyride_bus_assignments: {
                        easyride_routes: { name: 'Test Route' },
                        easyride_buses: { bus_number: 'BUS-101' }
                    },
                    easyride_qr_codes: { qr_code_data: 'qr-data-1' }
                }
            ]

            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/tickets/my-bookings')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ bookings: mockBookings })
                    })
                }
                if (url.includes('/api/users/log-access')) return Promise.resolve({ ok: true })
                return Promise.resolve({ ok: true })
            })

            await act(async () => {
                render(<ScanPage />)
            })

            // Wait for bookings to load
            await waitFor(() => {
                expect(screen.getByText('View QR Code')).toBeInTheDocument()
            })

            // Open Modal
            fireEvent.click(screen.getByText('View QR Code'))

            expect(screen.getByText('Ticket QR Code')).toBeInTheDocument()
            expect(screen.getByTestId('mock-qrcode-svg')).toBeInTheDocument()

            // Use getAllByText because "Test Route" is in both the list and the modal
            const routeElements = screen.getAllByText('Test Route')
            expect(routeElements.length).toBeGreaterThanOrEqual(1)

            // Close Modal
            fireEvent.click(screen.getByText('Close'))

            await waitFor(() => {
                expect(screen.queryByText('Ticket QR Code')).not.toBeInTheDocument()
            })
        })
    })
})
