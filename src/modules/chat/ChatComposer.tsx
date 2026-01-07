"use client";

import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea"; // optional: keep consistent UI
import { HorizontalLogo } from "@/core/config/svg";
import {
  addUserMessage,
  sendMessageAsync,
  setInput,
} from "@/core/store/slices/chatSlice";
import type { AppDispatch, RootState } from "@/core/store";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import React, { useCallback, useEffect, useMemo } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextarea";
import { useStickToBottom } from "./hooks/useStickToBottom";
import { MessageBubble } from "./MessageBubble";

// Helper for stable keys (prefer msg.id from your store; otherwise hash)
const keyOf = (msg: { id?: string | number; content: string }, index: number) =>
  msg.id ?? `${index}-${hashString(msg.content)}`;

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h.toString(36);
}

export default function ChatComposer() {
  const dispatch = useDispatch<AppDispatch>();
  const { input, loading, hasStartedResponse } = useSelector(
    (s: RootState) => s.chat,
  );

  const messages = useSelector((s: RootState) => s.chat.messages, shallowEqual);

  const { user } = useAuth();

  const { containerRef, onContentChange } =
    useStickToBottom<HTMLDivElement>(72);
  const { ref: textareaRef, onInput } =
    useAutoResizeTextarea<HTMLTextAreaElement>({
      value: input,
      maxHeight: 84,
    });

  const trimmed = useMemo(() => input.trim(), [input]);

  const handleSend = useCallback(() => {
    if (!trimmed) return;
    dispatch(addUserMessage(trimmed));
    dispatch(sendMessageAsync(trimmed));
    dispatch(setInput(""));
  }, [dispatch, trimmed]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(setInput(e.target.value));
    },
    [dispatch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!loading && trimmed) handleSend();
      }
    },
    [loading, trimmed, handleSend],
  );

  // Only scroll on new content if user is near bottom.
  useEffect(() => {
    onContentChange();
  }, [messages, onContentChange]);

  // Focus on mount (not on every message change).
  useEffect(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  return (
    <div className="flex h-full flex-1 flex-col justify-center">
      {!messages.length ? (
        <div className="text-muted-foreground mx-auto flex max-w-lg grow flex-col justify-center gap-5 text-center">
          <HorizontalLogo />
          <h3 className="text-foreground">Welcome to Skinbb Metaverse!</h3>
          <p className="text-lg">
            Connect, chat, and explore the future of beauty and skincare in the
            SkinBB Metaverse — where innovation meets self-expression.
          </p>
        </div>
      ) : (
        <div className="relative grow">
          <div
            ref={containerRef}
            className="mx-auto max-w-3xl space-y-6 overflow-y-auto pb-2"
          >
            {messages.map((msg, idx) => (
              <MessageBubble
                key={keyOf(msg, idx)}
                loading={loading && idx === messages.length - 1}
                isUser={msg.isUser}
                userProfile={user?.profilePic?.[0]?.url}
              >
                {msg.content}
              </MessageBubble>
            ))}

            {loading && !hasStartedResponse && (
              <MessageBubble loading>
                <p className="text-foreground text-lg italic">Thinking...</p>
              </MessageBubble>
            )}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 w-full pt-4 md:pt-8">
        <div className="bg-background mx-auto max-w-3xl pb-4">
          <div className="form-control h-full flex-col overflow-hidden rounded-2xl p-0 shadow">
            <Textarea
              ref={textareaRef}
              className="form-control min-h-[45px] resize-none border-0 bg-transparent text-lg leading-relaxed focus-visible:border-0 focus-visible:ring-0"
              placeholder="Ask me anything about skin care..."
              aria-label="Enter your prompt"
              aria-multiline="true"
              rows={1}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onInput={onInput}
            />
            <div className="flex items-center justify-end gap-2 p-2 pt-0">
              <Button
                className="rounded-full"
                onClick={handleSend}
                aria-label="Send message"
                disabled={loading || !trimmed}
                loading={loading}
                size="icon"
                color={"primary"}
                startIcon={<ArrowUpIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
