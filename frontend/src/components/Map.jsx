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
// UPDATE MAP LOCATION
// =====================================================

function LocationUpdater({ location }) {

    const map = useMap();


    useEffect(() => {

        if (!location) {

            return;

        }


        /*
         * Move the map smoothly to the user's
         * actual detected coordinates.
         */

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


    /*
     * Temporary map center.
     *
     * This is NOT treated as the user's location.
     *
     * The map will automatically move to the
     * actual location once the browser provides it.
     */

    const defaultLocation = [

        25.4358,

        81.8463

    ];


    const center = location

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
                    OPENSTREETMAP
                ===================================== */}

                <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* =====================================
                    UPDATE MAP WHEN LOCATION CHANGES
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

                    (hospital, index) => (

                        <Marker

                            key={

                                hospital.id ||

                                index

                            }

                            position={[

                                hospital.latitude,

                                hospital.longitude

                            ]}

                        >

                            <Popup>

                                🏥

                                {" "}

                                <strong>

                                    {hospital.name}

                                </strong>


                                {hospital.address && (

                                    <>

                                        <br />

                                        {hospital.address}

                                    </>

                                )}

                            </Popup>

                        </Marker>

                    )

                )}


                {/* =====================================
                    SHELTERS
                ===================================== */}

                {shelters.map(

                    (shelter, index) => (

                        <Marker

                            key={

                                shelter.id ||

                                index

                            }

                            position={[

                                shelter.latitude,

                                shelter.longitude

                            ]}

                        >

                            <Popup>

                                🏠

                                {" "}

                                <strong>

                                    {shelter.name}

                                </strong>

                            </Popup>

                        </Marker>

                    )

                )}


                {/* =====================================
                    DISASTER ALERTS
                ===================================== */}

                {alerts.map(

                    (alert, index) => (

                        <Marker

                            key={

                                alert.id ||

                                index

                            }

                            position={[

                                alert.latitude,

                                alert.longitude

                            ]}

                        >

                            <Popup>

                                🚨

                                {" "}

                                <strong>

                                    {alert.title ||

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

                            </Popup>

                        </Marker>

                    )

                )}

            </MapContainer>

        </div>

    );

}


export default Map;