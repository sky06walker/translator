import { onRequestPost as __api_dictionary_lookup_ts_onRequestPost } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\dictionary-lookup.ts"
import { onRequestPost as __api_text_to_speech_ts_onRequestPost } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\text-to-speech.ts"
import { onRequestPost as __api_translate_ts_onRequestPost } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\translate.ts"

export const routes = [
    {
      routePath: "/api/dictionary-lookup",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_dictionary_lookup_ts_onRequestPost],
    },
  {
      routePath: "/api/text-to-speech",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_text_to_speech_ts_onRequestPost],
    },
  {
      routePath: "/api/translate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_translate_ts_onRequestPost],
    },
  ]