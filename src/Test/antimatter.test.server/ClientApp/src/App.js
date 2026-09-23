import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import * as AmxReact from '@antimatterjs/react';
import './App.css';
function App() {
    var foo = new AmxReact.Binding();
    let s = nameof(foo);
    const [forecasts, setForecasts] = useState();
    useEffect(() => {
        populateWeatherData();
    }, []);
    const contents = forecasts === undefined
        ? _jsx("p", { children: _jsxs("em", { children: ["Loading... Please refresh once the ASP.NET backend has started. See ", _jsx("a", { href: "https://aka.ms/jspsintegrationreact", children: "https://aka.ms/jspsintegrationreact" }), " for more details."] }) })
        : _jsxs("table", { className: "table table-striped", "aria-labelledby": "tableLabel", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Temp. (C)" }), _jsx("th", { children: "Temp. (F)" }), _jsx("th", { children: "Summary" })] }) }), _jsx("tbody", { children: forecasts.map(forecast => _jsxs("tr", { children: [_jsx("td", { children: forecast.date }), _jsx("td", { children: forecast.temperatureC }), _jsx("td", { children: forecast.temperatureF }), _jsx("td", { children: forecast.summary })] }, forecast.date)) })] });
    return (_jsxs("div", { children: [_jsx("h1", { id: "tableLabel", children: "Weather forecast" }), _jsx("p", { children: "This component demonstrates fetching data from the server." }), contents] }));
    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }
}
export default App;
