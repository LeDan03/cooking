
import React, { useState, useEffect, useMemo } from 'react';
import useMessageBoxStore from '../store/useMessageBoxStore';
import usePersonalStore from '../store/usePersonalStore';

// API
import { readMessageResponse } from '../api/personal/messages';
import { HttpStatusCode } from 'axios';
import useAuthStore from '../store/useAuthStore';

// Component hiển thị chi tiết message
const MessageDetail = ({ message, onClose }) => {
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    };
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-gray-900 pr-4">{message.title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Nội dung
                            </h3>
                            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">{message.content}</p>
                        </div>
                        {/* <div>
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Lý do
                            </h3>
                            <p className="text-gray-600 bg-green-50 p-4 rounded-lg">{message.reasonId}</p>
                        </div> */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Thời gian: {formatDate(message.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component MessageBox chính - props interface for external use
const MessageBox = () => {
    const { messageBoxOpen: isOpen, setMessageBoxOpen } = useMessageBoxStore();
    const messages = usePersonalStore((state) => state.messages);
    const setMessages = usePersonalStore((state) => state.setMessages);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // const currentUser = useAuthStore((state) => state.currentUser);

    const closeMessageBox = () => {
        setMessageBoxOpen(false)
        setSelectedMessage(null);
    };

    const selectMessage = (message) => {
        setSelectedMessage(message);
    };

    const markAsRead = (messageId) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, read: true } : msg
            )
        );
    };

    // Đóng MessageBox khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.message-box-container')) {
                closeMessageBox();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMessageClick = async (message) => {
        //gửi request đã đọc xuống db
        const result = await readMessageResponse(message.id);
        if (result && result.status === HttpStatusCode.Ok) {
            markAsRead(message.id);
            selectMessage(message);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hôm nay';
        } else if (diffDays === 1) {
            return 'Hôm qua';
        } else if (diffDays < 7) {
            return `${diffDays} ngày trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    const unreadCount = useMemo(() => {
        return Array.isArray(messages) ? messages.filter(m => !m.read).length : 0;
    }, [messages]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 pointer-events-none">
                <div className="absolute top-16 right-4 lg:right-8 w-80 sm:w-96 max-w-[calc(100vw-2rem)] pointer-events-auto">
                    <div className="message-box-container bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Thông báo</h2>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={closeMessageBox}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="overflow-y-auto max-h-[60vh]">
                            {messages.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 font-medium">Không có thông báo nào</p>
                                    <p className="text-sm text-gray-400 mt-1">Thông báo mới sẽ xuất hiện ở đây</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {Array.isArray(messages) && messages.map((message) => (
                                        <div
                                            key={message.id}
                                            onClick={() => handleMessageClick(message)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] ${!message.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-medium ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {message.title}
                                                </h3>
                                                <div className="flex items-center ml-2">
                                                    {!message.read && (
                                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                                {message.content}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(message.createdAt)}
                                                </p>
                                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center text-xs text-gray-500">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {unreadCount > 0 ? `${unreadCount} tin nhắn chưa đọc` : 'Tất cả tin nhắn đã đọc'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Detail Modal - đè lên MessageBox */}
            {selectedMessage && (
                <MessageDetail
                    message={selectedMessage}
                    onClose={() => setSelectedMessage(null)}
                />
            )}
        </>
    );
};

export default MessageBox