import { Helmet } from "react-helmet-async";
import Solutions from "../components/Solutions";

function DiagnosticoPage() {
  return (
    <>
        <Helmet>
            <title>Diagnósticos Reumatológicos | Dr. Reuma</title>
            <meta
                name="description"
                content="Información sobre artritis, lupus, fibromialgia, osteoporosis y enfermedades autoinmunes."
            />
            </Helmet>

        <Solutions />
    </>
  );
}

export default DiagnosticoPage;