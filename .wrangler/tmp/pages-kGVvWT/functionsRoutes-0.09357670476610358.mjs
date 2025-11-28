import { onRequestPost as __api_text_to_speech_ts_onRequestPost } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\text-to-speech.ts"
import { onRequestPost as __api_translate_ts_onRequestPost } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\translate.ts"
import { onRequest as __api_dictionary_lookup_ts_onRequest } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\api\\dictionary-lookup.ts"
import { onRequestOptions as ___middleware_ts_onRequestOptions } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\_middleware.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\weihon\\Documents\\Source\\Github\\translator\\functions\\_middleware.ts"

export const routes = [
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
  {
      routePath: "/api/dictionary-lookup",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_dictionary_lookup_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [___middleware_ts_onRequestOptions],
      modules: [],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]