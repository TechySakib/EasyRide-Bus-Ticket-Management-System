const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rechargeModel = {
    // Create a new recharge request
    async createRequest(userId, amount, paymentMethod, phoneNumber, transactionId) {
        try {
            const { data, error } = await supabase
                .from('easyride_recharge_requests')
                .insert([
                    {
                        user_id: userId,
                        amount: parseFloat(amount),
                        payment_method: paymentMethod.toLowerCase(), // Convert to lowercase
                        phone_number: phoneNumber,
                        transaction_id: transactionId,
                        status: 'pending'
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating recharge request:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all requests for a specific user
    async getRequestsByUser(userId) {
        try {
            const { data, error } = await supabase
                .from('easyride_recharge_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching user recharge requests:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all requests (admin only), optionally filtered by status
    async getAllRequests(status = null) {
        try {
            let query = supabase
                .from('easyride_recharge_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data: requests, error } = await query;

            if (error) throw error;

            // Fetch user details for each request
            const requestsWithUsers = await Promise.all(
                requests.map(async (request) => {
                    const { data: userData } = await supabase.auth.admin.getUserById(request.user_id);
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, phone_number')
                        .eq('id', request.user_id)
                        .single();

                    return {
                        ...request,
                        user: {
                            full_name: profile?.full_name || userData?.user?.email || 'Unknown',
                            phone_number: profile?.phone_number || 'N/A'
                        }
                    };
                })
            );

            return { success: true, data: requestsWithUsers };
        } catch (error) {
            console.error('Error fetching all recharge requests:', error);
            return { success: false, error: error.message };
        }
    },

    // Get a single request by ID
    async getRequestById(requestId) {
        try {
            const { data, error } = await supabase
                .from('easyride_recharge_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (error) throw error;

            // Fetch user details
            const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone_number')
                .eq('id', data.user_id)
                .single();

            return {
                success: true,
                data: {
                    ...data,
                    user: {
                        full_name: profile?.full_name || userData?.user?.email || 'Unknown',
                        phone_number: profile?.phone_number || 'N/A'
                    }
                }
            };
        } catch (error) {
            console.error('Error fetching recharge request:', error);
            return { success: false, error: error.message };
        }
    },

    // Approve a recharge request and update wallet balance
    async approveRequest(requestId, adminId) {
        try {
            // First, get the request details
            const requestResult = await this.getRequestById(requestId);
            if (!requestResult.success) {
                return requestResult;
            }

            const request = requestResult.data;

            // Check if already processed
            if (request.status !== 'pending') {
                return { success: false, error: 'Request has already been processed' };
            }

            // Update the request status
            const { error: updateError } = await supabase
                .from('easyride_recharge_requests')
                .update({
                    status: 'approved',
                    processed_at: new Date().toISOString(),
                    processed_by: adminId
                })
                .eq('id', requestId)
                .eq('status', 'pending'); // Ensure it's still pending

            if (updateError) throw updateError;

            // Get or create wallet
            const { data: wallet, error: walletError } = await supabase
                .from('easyride_wallets')
                .select('*')
                .eq('user_id', request.user_id)
                .single();

            if (walletError && walletError.code !== 'PGRST116') {
                throw walletError;
            }

            let walletId;
            if (wallet) {
                // Update existing wallet
                const newBalance = parseFloat(wallet.balance) + parseFloat(request.amount);
                const { error: balanceError } = await supabase
                    .from('easyride_wallets')
                    .update({
                        balance: newBalance,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', request.user_id);

                if (balanceError) throw balanceError;
                walletId = wallet.id;
            } else {
                // Create new wallet
                const { data: newWallet, error: createError } = await supabase
                    .from('easyride_wallets')
                    .insert([
                        {
                            user_id: request.user_id,
                            balance: parseFloat(request.amount)
                        }
                    ])
                    .select()
                    .single();

                if (createError) throw createError;
                walletId = newWallet.id;
            }

            // Create transaction record
            await supabase
                .from('easyride_transactions')
                .insert([
                    {
                        wallet_id: walletId,
                        amount: parseFloat(request.amount),
                        type: 'recharge',
                        description: `Recharge approved - ${request.payment_method} - TxID: ${request.transaction_id}`
                    }
                ]);

            return { success: true, message: 'Recharge request approved successfully' };
        } catch (error) {
            console.error('Error approving recharge request:', error);
            return { success: false, error: error.message };
        }
    },

    // Reject a recharge request
    async rejectRequest(requestId, adminId, reason) {
        try {
            // Check if request exists and is pending
            const requestResult = await this.getRequestById(requestId);
            if (!requestResult.success) {
                return requestResult;
            }

            const request = requestResult.data;

            if (request.status !== 'pending') {
                return { success: false, error: 'Request has already been processed' };
            }

            // Update the request status
            const { error } = await supabase
                .from('easyride_recharge_requests')
                .update({
                    status: 'rejected',
                    processed_at: new Date().toISOString(),
                    processed_by: adminId,
                    rejection_reason: reason
                })
                .eq('id', requestId)
                .eq('status', 'pending');

            if (error) throw error;

            return { success: true, message: 'Recharge request rejected successfully' };
        } catch (error) {
            console.error('Error rejecting recharge request:', error);
            return { success: false, error: error.message };
        }
    },

    // Get wallet balance for a user
    async getWalletBalance(userId) {
        try {
            const { data, error } = await supabase
                .from('easyride_wallets')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Wallet doesn't exist, create it
                const { data: newWallet, error: createError } = await supabase
                    .from('easyride_wallets')
                    .insert([{ user_id: userId, balance: 0.00 }])
                    .select()
                    .single();

                if (createError) throw createError;
                return { success: true, balance: 0.00 };
            }

            if (error) throw error;
            return { success: true, balance: parseFloat(data.balance) };
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = rechargeModel;

