/*
 * A browser environment for the interaction tests. Import it before anything from React or Radix: react-dom and
 * some Radix modules check for a document once, when they load.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "https://ui.abnormalhq.com/" });
// Tells React it runs under act(), so state updates flush before each assertion.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
