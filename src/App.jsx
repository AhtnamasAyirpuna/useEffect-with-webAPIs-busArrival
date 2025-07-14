import { useState, useEffect } from 'react';
import { Col, Form, Row, Container, Spinner, Alert, ListGroup } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

function BusService({ services }) {
  return (
    <ListGroup className="mt-3">
      {services.map((service) => {
        const arrival = service.next_bus_mins;
        const busNumber = service.bus_no;
        const result = arrival < 0 ? 'Arrived' : `${arrival} minutes`;

        return (
          <ListGroup.Item key={busNumber} className="d-flex justify-content-between align-items-center">
            <div className="fs-4">Bus {busNumber}: <span className="fw-bold">{result}</span></div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

async function fetchBusArrival(id) {
  const response = await fetch(`https://sg-bus-arrivals.vercel.app/?id=${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return await response.json();
}

export default function App() {
  const [busStopId, setBusStopId] = useState('');
  const [busArrivalData, setBusArrivalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const trimmedId = busStopId.trim();

    //If busStopId is empty, clear data and errors, then exit
    if (!trimmedId) {
      setBusArrivalData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setBusArrivalData(null);

    fetchBusArrival(trimmedId)
      .then((data) => {
        if (data && data.bus_stop_id && Array.isArray(data.services)) {
          setBusArrivalData(data);
          setError(null);
        } else {
          setError("Invalid data structure");
          setBusArrivalData(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load bus data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [busStopId]);

  const handleInputChange = (e) => {
    setBusStopId(e.target.value);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center mb-4">
          <img
            src="https://pics.clipartpng.com/Red_Bus_PNG_Clipart-559.png"
            alt="red bus"
            className="img-fluid mb-3"
            style={{ maxWidth: '150px' }}
          />
          <h1 className="display-4 fw-bold mb-3">Bus Arrival App</h1>
          <p className="lead text-muted">
            Try entering bus stop ID <strong>18141</strong> or find one{" "}
            <a href="https://www.mytransport.sg/content/mytransport/home/buses/bus-arrival-info.html" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Form.Control
            type="text"
            value={busStopId}
            onChange={handleInputChange}
            placeholder="Enter Bus Stop ID"
            className="mb-3"
          />

          {busStopId.trim() && loading && (
            <div className="text-center my-3">
              <Spinner animation="border" variant="info" />
              <p className="text-info mt-2">Loading...</p>
            </div>
          )}

          {busStopId.trim() && error && <Alert variant="danger" className="my-3">{error}</Alert>}

          {busStopId.trim() && busArrivalData && (
            <>
              <h2 className="mt-4 mb-3 text-center">Bus Stop {busArrivalData.bus_stop_id}</h2>

              {busArrivalData.services.length > 0 ? (
                <BusService services={busArrivalData.services} />
              ) : (
                <Alert variant="info" className="my-3">
                  No bus arrival information currently available for this stop.
                </Alert>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

