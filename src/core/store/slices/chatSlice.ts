import { basePythonApiUrl } from "@/core/config/baseUrls";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "..";

type Message = {
  isUser: boolean;
  content: string;
};

interface ChatState {
  messages: Message[];
  input: string;
  loading: boolean;
  hasStartedResponse: boolean;
  error?: string;
}

const initialState: ChatState = {
  messages: [],
  input: "",
  loading: false,
  hasStartedResponse: false,
};

type QA = {
  query: string;
  response: string;
};

function convertChatLog(chatLog: Message[]): QA[] {
  const result: QA[] = [];

  for (let i = 0; i < chatLog.length; i++) {
    if (chatLog[i].isUser && chatLog[i + 1] && !chatLog[i + 1].isUser) {
      result.push({
        query: chatLog[i].content.trim(),
        response: chatLog[i + 1].content.trim(),
      });
    }
  }

  return result;
}

export const sendMessageAsync = createAsyncThunk<
  string, // Return type
  string, // Input argument (the query)
  { dispatch: AppDispatch; rejectValue: string }
>(
  "chat/sendMessage",
  async (query, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await fetch(`${basePythonApiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query,
          history: convertChatLog((getState() as RootState).chat.messages),
        }),
      });

      if (res.status !== 200) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      dispatch(addBotMessageChunk(""));
      dispatch(setHasStartedResponse(false));

      let partial = "";
      let hasStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        const lines = partial.split("\n");
        // keep incomplete line at end (if any)
        partial = lines.pop() || "";

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);

            if (parsed.response && !hasStarted) {
              dispatch(setHasStartedResponse(true));
              hasStarted = true;
            }

            if (parsed.response) {
              dispatch(addBotMessageChunk(parsed.response + " "));
            }
            if (parsed.done) return "done";
          } catch {
            console.warn("Skipping bad JSON chunk:", line);
          }
        }
      }

      return "done";
    } catch {
      return rejectWithValue("Failed to contact server.");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ isUser: true, content: action.payload });
    },
    resetChat: (state) => {
      state.messages = [];
      state.input = "";
      state.loading = false;
      state.error = undefined;
    },
    addBotMessageChunk: (state, action: PayloadAction<string>) => {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && !lastMsg.isUser) {
        lastMsg.content += action.payload;
      } else {
        state.messages.push({ isUser: false, content: action.payload });
      }
    },
    setHasStartedResponse: (state, action: PayloadAction<boolean>) => {
      state.hasStartedResponse = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageAsync.pending, (state) => {
        state.loading = true;
        state.hasStartedResponse = false;
        state.error = undefined;
      })
      .addCase(sendMessageAsync.fulfilled, (state) => {
        state.loading = false;
        // state.hasStartedResponse = true;
        // state.messages.push({ isUser: false, content: action.payload });
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.loading = false;
        // state.hasStartedResponse = false;
        state.error = String(action.payload) || "Unknown error";
        state.messages.push({
          isUser: false,
          content: "⚠️ Failed to get response.",
        });
      });
  },
});

export const {
  setInput,
  addUserMessage,
  resetChat,
  addBotMessageChunk,
  setHasStartedResponse,
} = chatSlice.actions;
export default chatSlice.reducer;
