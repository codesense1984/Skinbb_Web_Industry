import { basePythonApiUrl } from "@/config/baseUrls";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AppDispatch } from "../store";

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

export const sendMessageAsync = createAsyncThunk<
  string, // Return type
  string, // Input argument (the query)
  { dispatch: AppDispatch; rejectValue: string }
>("chat/sendMessage", async (query, { rejectWithValue, dispatch }) => {
  try {
    // const response = await axios.post("http://localhost:11434/api/generate", {
    //   model: "gemma3:1b",
    //   prompt: query,
    //   stream: true,
    // });
    const res = await fetch(`${basePythonApiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.body) throw new Error("No response body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    dispatch(addBotMessageChunk(""));
    dispatch(setHasStartedResponse(false));
    // let fullResponse = "";

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
    // return fullResponse.trim();
    // return response.data?.response || "No response from server.";
  } catch {
    dispatch(addBotMessageChunk("⚠️ Failed to respond.\n"));
    return rejectWithValue("Failed to contact server.");
  }
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(
  //       "According to the context provided, niacinamide has the following benefits for the skin:\n\n1. Brightening - It can help even out skin tone and reduce dullness, giving the skin a brighter appearance.\n\n2. Anti-inflammatory - Niacinamide has soothing properties that can help calm irritation and redness in the skin. This makes it beneficial for sensitive or acne-prone skin.\n\nSo in summary, niacinamide is an active skincare ingredient that can help brighten the complexion, reduce inflammation, and is suitable for those dealing with uneven skin tone, dullness, sensitivity or acne. It is a versatile ingredient with multiple benefits for the skin.",
  //     );
  //   }, 1000); // Simulate network delay)
  // });
  // try {
  //   const res = await axios.post(
  //     `${basePythonApiUrl}/api/chat`,
  //     { query },
  //     {
  //       headers: { "Content-Type": "application/json" },
  //       // body: JSON.stringify({ query }),
  //     },
  //   );

  //   console.log("🚀 ~ > ~ res.data:", res.data);

  //   if (!res.data) throw new Error("No response body");
  //   // debugger;

  //   const reader = res.data.getReader();
  //   const decoder = new TextDecoder("utf-8");

  //   console.log("🚀 ~ > ~ data:", res);
  //   // const data = await res.json();
  //   return "";
  // } catch {
  //   return rejectWithValue("Failed to contact server.");
  // }
});

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
