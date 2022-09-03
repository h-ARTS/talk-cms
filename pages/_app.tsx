import "@/styles/root.css"
import "@/styles/split-pane.css"
import type { AppProps } from "next/app"
import { Provider } from "react-redux"
import store from "@/src/store"
import DndProviderWrapper from "@/src/components/DndProviderWrapper"
import Layout from "@/src/components/Layout"

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Layout>
        <DndProviderWrapper>
          <Component {...pageProps} />
        </DndProviderWrapper>
      </Layout>
    </Provider>
  )
}

export default App
