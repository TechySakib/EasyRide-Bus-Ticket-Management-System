const WebSocket = require('ws');

exports.chatWithAgent = async (req, res) => {
    try {
        const { message, history } = req.body;
        const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17";

        const ws = new WebSocket(url, {
            headers: {
                "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
                "OpenAI-Beta": "realtime=v1",
            },
        });

        let responseSent = false;

        ws.on("open", function open() {
            // Send user message
            ws.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: message
                        }
                    ]
                }
            }));

            // Request a response
            ws.send(JSON.stringify({
                type: "response.create",
                response: {
                    modalities: ["text"],
                    instructions: "You are Sakib Al Hasan, a helpful support agent for EasyRide Bus Ticket Management System. You are polite, professional, and concise."
                }
            }));
        });

        ws.on("message", function incoming(data) {
            const event = JSON.parse(data.toString());

            if (event.type === "response.text.done") {
                if (!responseSent) {
                    res.status(200).json({
                        success: true,
                        reply: event.text
                    });
                    responseSent = true;
                    ws.close();
                }
            } else if (event.type === "error") {
                console.error("Realtime API Error Event:", event);
                if (!responseSent) {
                    res.status(500).json({
                        success: false,
                        message: "Realtime API Error",
                        error: event.error
                    });
                    responseSent = true;
                    ws.close();
                }
            }
        });

        ws.on("error", function error(err) {
            console.error("WebSocket Error:", err);
            if (!responseSent) {
                res.status(500).json({
                    success: false,
                    message: "WebSocket connection failed",
                    error: err.message
                });
                responseSent = true;
            }
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
