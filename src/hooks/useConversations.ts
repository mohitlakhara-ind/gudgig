"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';
import { Conversation, ConversationsResponse, Message, ApiResponse } from '@/types/api';

export function useConversations() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchConversations = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res: ConversationsResponse = await apiClient.getConversations();
			setConversations(res.data || []);
		} catch (err: any) {
			setError(err?.message || 'Failed to load conversations');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
		const res: ApiResponse<Message[]> = await apiClient.getMessages(conversationId);
		return res.data || [];
	}, []);

	const sendMessage = useCallback(async (conversationId: string, payload: { content?: string; attachments?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }) => {
		return apiClient.sendMessage(conversationId, payload);
	}, []);

	const startConversation = useCallback(async (participantId: string, orderId?: string) => {
		return apiClient.startConversation(participantId, orderId);
	}, []);

	const markAsRead = useCallback(async (conversationId: string) => {
		return apiClient.markConversationRead(conversationId);
	}, []);

	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	return useMemo(() => ({
		conversations,
		isLoading,
		error,
		fetchConversations,
		getMessages,
		sendMessage,
		startConversation,
		markAsRead,
	}), [conversations, isLoading, error, fetchConversations, getMessages, sendMessage, startConversation, markAsRead]);
}

export default useConversations;
