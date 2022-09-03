import "@/styles/split-pane.css"
import type { AppProps } from "next/app"
import { Provider } from "react-redux"
import store from "@/src/store"
import Layout from "@/src/components/Layout"
function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Layout>
          <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default App
