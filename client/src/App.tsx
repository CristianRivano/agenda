import { Toaster } from "sonner";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Confirmation from "./pages/Confirmation";
import OwnerApp from "./pages/OwnerApp";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/book/Nanai" component={Book} />
    <Route path="/confirmation" component={Confirmation} />
    <Route path="/app" component={OwnerApp} />
    <Route path="/app/:section" component={OwnerApp} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  const base = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");
  return <ErrorBoundary><Toaster position="bottom-right" toastOptions={{ style: { background: "#522129", color: "#FDF3E7", border: "1px solid #9e6c43" } }} /><WouterRouter base={base}><Router /></WouterRouter></ErrorBoundary>;
}
