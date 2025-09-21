"use client";

import React, { useState } from "react";

// Interface for trading rules
interface TradingRule {
    id: string;
    ticker: string;
    action: "buy" | "sell";
    condition: "greater_than" | "less_than";
    threshold: number;
    quantity: number;
    originalCode: string;
}

const ThreeSectionLayout = () => {
    // State for chat history
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

    // State for trading cards
    const [tradingCards, setTradingCards] = useState<TradingRule[]>([]);

    // State for input forms
    const [userInput, setUserInput] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [processedMessage, setProcessedMessage] = useState("");

    // Parse trading code and extract rules
    const parseTradingCode = (code: string): TradingRule[] => {
        const rules: TradingRule[] = [];
        const lines = code.split("\n").filter((line) => line.trim());

        lines.forEach((line, index) => {
            try {
                // Match patterns like: if NVDA price < 180: buy 15 NVDA
                const priceMatch = line.match(
                    /if\s+(\w+)\s+price\s+([<>]=?)\s+(\d+(?:\.\d+)?)\s*:\s*(buy|sell)\s+(\d+)\s+\w+/i
                );

                if (priceMatch) {
                    const [, ticker, operator, threshold, action, quantity] = priceMatch;

                    const rule: TradingRule = {
                        id: `rule_${Date.now()}_${index}`,
                        ticker: ticker.toUpperCase(),
                        action: action.toLowerCase() as "buy" | "sell",
                        condition: operator === ">" || operator === ">=" ? "greater_than" : "less_than",
                        threshold: parseFloat(threshold),
                        quantity: parseInt(quantity),
                        originalCode: line.trim(),
                    };

                    rules.push(rule);
                }
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        });

        return rules;
    };

    // Handle input processing
    const handleProcessInput = () => {
        if (!userInput.trim()) {
            setProcessedMessage("Please enter some text first!");
            return;
        }

        try {
            const newRules = parseTradingCode(userInput);

            if (newRules.length === 0) {
                setProcessedMessage(
                    "No valid trading rules found. Please use format: 'if TICKER price < THRESHOLD: buy QUANTITY TICKER'"
                );
                return;
            }

            // Add new trading cards
            setTradingCards((prev) => [...prev, ...newRules]);
            setProcessedMessage(`Successfully parsed ${newRules.length} trading rule(s)!`);
            setUserInput(""); // Clear input after processing
        } catch (error) {
            setProcessedMessage(`Error parsing code: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    // Handle chat message sending
    const handleSendMessage = () => {
        if (chatInput.trim()) {
            const newUserMessage = { role: "user", content: chatInput };
            const aiResponse = {
                role: "ai",
                content: `Thanks for your message: '${chatInput}'. This is a placeholder AI response.`,
            };

            setChatHistory((prev) => [...prev, newUserMessage, aiResponse]);
            setChatInput("");
        }
    };

    // Handle clearing chat
    const handleClearChat = () => {
        setChatHistory([]);
    };

    // Handle trading card click - open Flask app with pre-populated data
    const handleCardClick = (rule: TradingRule) => {
        // Create URL parameters for the Flask app
        const params = new URLSearchParams({
            ticker: rule.ticker,
            action: rule.action,
            condition: rule.condition,
            threshold: rule.threshold.toString(),
            quantity: rule.quantity.toString(),
        });

        // Open Flask app in new tab with parameters
        const flaskUrl = `http://127.0.0.1:5001/?${params.toString()}`;
        window.open(flaskUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Main Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Three-Section Layout Demo</h1>

            <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[calc(100vh-120px)]">
                {/* TOP LEFT QUADRANT: Input Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">📝 Input Section</h2>

                    <div className="space-y-4">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Enter your code here..."
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                        />

                        <button
                            onClick={handleProcessInput}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            Process Input
                        </button>

                        {processedMessage && (
                            <div
                                className={`p-3 rounded-md ${
                                    processedMessage.includes("Please")
                                        ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                        : "bg-green-50 text-green-800 border border-green-200"
                                }`}
                            >
                                {processedMessage}
                            </div>
                        )}

                        {userInput && (
                            <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                                <div className="text-sm font-semibold mb-1">Current input:</div>
                                <pre className="text-xs overflow-x-auto">{userInput}</pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - Cards section spanning two quadrants */}
                <div className="row-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">��📋 Trading Rules</h2>

                    {/* Scrollable Cards Container */}
                    <div className="h-full overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                        <div className="space-y-3">
                            {tradingCards.length === 0 ? (
                                <div className="text-center text-gray-500 italic py-8">
                                    <i className="fas fa-chart-line text-3xl mb-3 block"></i>
                                    <p>Enter trading code and click "Process Input" to create trading rules.</p>
                                </div>
                            ) : (
                                tradingCards.map((rule) => (
                                    <div
                                        key={rule.id}
                                        onClick={() => handleCardClick(rule)}
                                        className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-gray-800">{rule.ticker}</div>
                                            <div
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    rule.action === "buy"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {rule.action.toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Condition:</span>
                                                Price {rule.condition === "greater_than" ? ">" : "<"} ${rule.threshold}
                                            </div>
                                            <div>
                                                <span className="font-medium">Quantity:</span> {rule.quantity} shares
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 font-mono">{rule.originalCode}</div>
                                        </div>

                                        <div className="mt-2 text-xs text-blue-600">
                                            <i className="fas fa-external-link-alt mr-1"></i>
                                            Click to open in Flask app
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM LEFT QUADRANT: AI Chat Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">�� AI Chat</h2>

                    {/* Chat Display Area */}
                    <div className="h-40 overflow-y-auto border border-gray-200 rounded-md p-3 mb-4 bg-gray-50">
                        {chatHistory.length === 0 ? (
                            <div className="text-gray-500 italic">Start a conversation with the AI bot...</div>
                        ) : (
                            <div className="space-y-3">
                                {chatHistory.map((message, index) => (
                                    <div key={index} className="mb-2">
                                        <strong
                                            className={message.role === "user" ? "text-blue-600" : "text-green-600"}
                                        >
                                            {message.role === "user" ? "You:" : "AI:"}
                                        </strong>
                                        <span className="ml-2">{message.content}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Type your message here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={handleSendMessage}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                Send
                            </button>
                            <button
                                onClick={handleClearChat}
                                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
                            >
                                Clear Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreeSectionLayout;
