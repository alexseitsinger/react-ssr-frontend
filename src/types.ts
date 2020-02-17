import { Request as ExpressRequest, Response as ExpressResponse } from "express"
import { History as BrowserHistory, MemoryHistory } from "history"
import { Store } from "redux"

export interface AppProps {
  [key: string]: any;
}

export interface State {
  [key: string]: any;
}

export type CreateStore = (
  routerHistory: MemoryHistory | BrowserHistory,
  initialState: State
) => Store

export type ExpressHandler = (req: ExpressRequest, res: ExpressResponse) => void

export type FirstHandler = () => ExpressHandler
