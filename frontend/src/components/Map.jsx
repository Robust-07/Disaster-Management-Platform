import { useEffect } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";


// =====================================================
// FIX LEAFLET ICONS
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"

});


// =====================================================
// GET LATITUDE / LONGITUDE FROM BACKEND OBJECT
// =====================================================

function getCoordinates(item) {

    if (!item) {
        return null;
    }


    // -------------------------------------------------
    // FORMAT 1:
    // {
    //   latitude: 27.10,
    //   longitude: 79.28
    // }
    // -------------------------------------------------

    if (
        typeof item.latitude === "number" &&
        typeof item.longitude === "number"
    ) {

        return [
            item.latitude,
            item.longitude
        ];

    }


    // -------------------------------------------------
    // FORMAT 2:
    // GeoJSON
    //
    // location.coordinates:
    // [longitude, latitude]
    // -------------------------------------------------

    if (
        item.location &&
        Array.isArray(item.location.coordinates) &&
        item.location.coordinates.length >= 2
    ) {

        const longitude =
            Number(item.location.coordinates[0]);

        const latitude =
            Number(item.location.coordinates[1]);


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return [
                latitude,
                longitude
            ];

        }

    }


    // -------------------------------------------------
    // FORMAT 3:
    // coordinates directly
    // [longitude, latitude]
    // -------------------------------------------------

    if (
        Array.isArray(item.coordinates) &&
        item.coordinates.length >= 2
    ) {

        const longitude =
            Number(item.coordinates[0]);

        const latitude =
            Number(item.coordinates[1]);


        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {

            return [
                latitude,
                longitude
            ];

        }

    }


    // -------------------------------------------------
    // INVALID LOCATION
    // -------------------------------------------------

    console.warn(
        "Skipping item with invalid coordinates:",
        item
    );

    return null;
}


// =====================================================
// UPDATE MAP LOCATION
// =====================================================

function LocationUpdater({ location }) {

    const map = useMap();


    useEffect(() => {

        if (
            !location ||
            typeof location.latitude !== "number" ||
            typeof location.longitude !== "number"
        ) {

            return;

        }


        map.flyTo(

            [
                location.latitude,
                location.longitude
            ],

            15,

            {
                duration: 1.5
            }

        );

    }, [location, map]);


    return null;
}


// =====================================================
// MAP
// =====================================================

function Map({

    location,

    alerts = [],

    hospitals = [],

    shelters = []

}) {


    // -------------------------------------------------
    // DEFAULT LOCATION
    // -------------------------------------------------

    const defaultLocation = [

        25.4358,

        81.8463

    ];


    const center =

        location &&
        typeof location.latitude === "number" &&
        typeof location.longitude === "number"

            ? [
                location.latitude,
                location.longitude
            ]

            : defaultLocation;


    return (

        <div className="map-wrapper">


            <MapContainer

                center={center}

                zoom={15}

                className="leaflet-map"

            >


                {/* =====================================
                    OPEN STREET MAP
                ===================================== */}

                <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* =====================================
                    UPDATE MAP WHEN USER LOCATION CHANGES
                ===================================== */}

                <LocationUpdater

                    location={location}

                />


                {/* =====================================
                    USER LOCATION
                ===================================== */}

                {location && (

                    <Marker

                        position={[

                            location.latitude,

                            location.longitude

                        ]}

                    >

                        <Popup>

                            <strong>
                                📍 You are here
                            </strong>

                            <br />

                            Latitude:
                            {" "}
                            {location.latitude.toFixed(6)}

                            <br />

                            Longitude:
                            {" "}
                            {location.longitude.toFixed(6)}

                        </Popup>

                    </Marker>

                )}


                {/* =====================================
                    HOSPITALS
                ===================================== */}

                {hospitals.map(

                    (hospital, index) => {

                        const coords =
                            getCoordinates(hospital);


                        // Don't render invalid coordinates

                        if (!coords) {
                            return null;
                        }


                        return (

                            <Marker

                                key={
                                    hospital.id ||
                                    hospital._id ||
                                    index
                                }

                                position={coords}

                            >

                                <Popup>

                                    🏥{" "}

                                    <strong>

                                        {
                                            hospital.name ||
                                            hospital.title ||
                                            "Hospital"
                                        }

                                    </strong>


                                    {hospital.address && (

                                        <>

                                            <br />

                                            {hospital.address}

                                        </>

                                    )}

                                </Popup>

                            </Marker>

                        );

                    }

                )}


                {/* =====================================
                    SHELTERS
                ===================================== */}

                {shelters.map(

                    (shelter, index) => {

                        const coords =
                            getCoordinates(shelter);


                        if (!coords) {
                            return null;
                        }


                        return (

                            <Marker

                                key={
                                    shelter.id ||
                                    shelter._id ||
                                    index
                                }

                                position={coords}

                            >

                                <Popup>

                                    🏠{" "}

                                    <strong>

                                        {
                                            shelter.name ||
                                            shelter.title ||
                                            "Shelter"
                                        }

                                    </strong>


                                    {shelter.address && (

                                        <>

                                            <br />

                                            {shelter.address}

                                        </>

                                    )}

                                </Popup>

                            </Marker>

                        );

                    }

                )}


                {/* =====================================
                    DISASTER ALERTS
                ===================================== */}

                {alerts.map(

                    (alert, index) => {

                        const coords =
                            getCoordinates(alert);


                        if (!coords) {
                            return null;
                        }


                        return (

                            <Marker

                                key={
                                    alert.id ||
                                    alert._id ||
                                    index
                                }

                                position={coords}

                            >

                                <Popup>

                                    🚨{" "}

                                    <strong>

                                        {
                                            alert.title ||
                                            alert.type ||
                                            "Disaster Alert"
                                        }

                                    </strong>


                                    {alert.description && (

                                        <>

                                            <br />

                                            {alert.description}

                                        </>

                                    )}


                                    {alert.severity && (

                                        <>

                                            <br />

                                            Severity:
                                            {" "}
                                            {alert.severity}

                                        </>

                                    )}

                                </Popup>

                            </Marker>

                        );

                    }

                )}

            </MapContainer>

        </div>

    );

}


export default Map;