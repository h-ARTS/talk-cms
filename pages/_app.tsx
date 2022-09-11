import type { AppProps } from "next/app"
import { Provider } from "react-redux"
import "@/styles/split-pane.css"
import store from "@/store/index"
import DndProviderWrapper from "@/components/DndProviderWrapper"
import Layout from "@/components/Layout"

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
