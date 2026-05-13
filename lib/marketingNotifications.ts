"use client";
import { useState, useEffect } from 'react';

export type TargetType = 'all' | 'single';

export interface NotificationTarget {
  type: TargetType;
  userId?: string;
  userName?: string; // For display in history
}

export interface NotificationPayload {
  id: string;
  target: NotificationTarget;
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  scheduledAt?: number; // timestamp, if null/undefined it means "now"
  createdAt: number;
  status: 'sent' | 'scheduled';
}

class MarketingStore {
  private history: NotificationPayload[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    // In-memory only. No localStorage loading.
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getHistory() {
    return [...this.history].sort((a, b) => b.createdAt - a.createdAt);
  }

  async sendNotification(data: Omit<NotificationPayload, 'id' | 'createdAt' | 'status'>): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newNotification: NotificationPayload = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      status: data.scheduledAt && data.scheduledAt > Date.now() ? 'scheduled' : 'sent'
    };

    this.history.unshift(newNotification);
    // Keep only last 50 items
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }
    this.notify();
  }
}

export const marketingStore = new MarketingStore();

export const useMarketingHistory = () => {
  const [history, setHistory] = useState<NotificationPayload[]>(marketingStore.getHistory());

  useEffect(() => {
    const update = () => setHistory(marketingStore.getHistory());
    update();
    return marketingStore.subscribe(update);
  }, []);

  return { history };
};