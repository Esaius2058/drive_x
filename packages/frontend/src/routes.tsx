import App from "./App";
import Landing from "./components/Landing";

const MainRoutes = () => {
    const routes = [{
        path: "/",
        element: <App />,
        children: [{
            index: true,
            element: <Landing />
        }]      
    }
    ];

    return routes;
}

export default MainRoutes;