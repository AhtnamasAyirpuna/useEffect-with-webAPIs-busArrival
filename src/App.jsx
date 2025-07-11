import { useState, useEffect } from 'react';

function BusService({ busArrivalData }) {
  //busArrivalData ={
  //services: [
  // {bus_no: 123, next_bus_mins: 12},
  // {bus_no: 169, next_bus_mins: -1}
  //]
  //}

  return (
    <ul>
      {busArrivalData.services.map((service) => {
        const arrival = service.next_bus_mins;
        const busNumber = service.bus_no;
        const result = arrival < 0 ? 'Arrived' : `${arrival} minutes`;

        return (
          <li key={busNumber}>
            Bus {busNumber}: {result}
          </li>
        );
      })}
    </ul>
  );
}

async function fetchBusArrival(id) {
  const response = await fetch(`https://sg-bus-arrivals.vercel.app/?id=${id}`);
  const data = await response.json();
  return data;
}

export default function App() {
  const [busStopId, setBusStopId] = useState(undefined);
  const [busArrivalData, setBusArrivalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const options = [ 
    "18141",
    "18131",
  ];

  useEffect(() => {
    console.log('Rendered')
    if (busStopId) {
      setLoading(true);
      fetchBusArrival(busStopId) //async function
        .then((data) => setBusArrivalData(data))
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    }
  }, [busStopId]);

  function handleInputChange(event) {
    setBusStopId(event.target.value);
  }

  return (
    <div>
      <h1>Bus Arrival App</h1>
      <select onChange={handleInputChange}>
        <option>Select Bus Stop ID</option>
        {options.map((option,index) => {
          return (
            <option key={index}>
              {option}
            </option>
          );
        })}
     </select>
      {loading && <p>Loading...</p>}
      {busArrivalData && busArrivalData.services && (
        <>
          <h2>Bus Stop {busArrivalData.bus_stop_id}</h2>
          <BusService busArrivalData={busArrivalData} />
        </>
      )}
    </div>
  );
}
