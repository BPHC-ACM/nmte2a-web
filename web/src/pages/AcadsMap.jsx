import CampusMap from "./CampusMap";

const AcadsMap = () => {
  const academicsLocations = [
    {
      name: "F Block",
      position: [17.544826, 78.571054],
    },
    {
      name: "New Acad block",
      position: [17.545711, 78.570051],
    },
    // add more locations
  ];

  return (
    <CampusMap center={[17.545388, 78.570625]} locations={academicsLocations} />
  );
};

export default AcadsMap;
