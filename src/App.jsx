
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function Home() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInternships() {
      try {
        const response = await fetch(`${API_URL}/api/internships`);
        if (!response.ok) throw new Error("Failed to load internships.");
        setInternships(await response.json());
      } catch {
        setError("Unable to load internships. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    }
    loadInternships();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">START YOUR CAREER</p>
        <h1>Find Your Internship</h1>
        <p>
          Explore opportunities, develop practical skills, and take your first
          step toward your dream career.
        </p>
        <a className="button-link" href="#internships">
          Explore Internships
        </a>
      </section>

      <section id="internships" className="section">
        <h2>Available Internships</h2>
        <p className="section-description">
          Choose an opportunity that matches your interests.
        </p>

        {loading && <p>Loading internships...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && internships.length === 0 && (
          <p>No internships are available right now.</p>
        )}

        <div className="internship-grid">
          {internships.map((internship) => (
            <article className="internship-card" key={internship.id}>
              <div className="card-icon">✦</div>
              <p className="company">{internship.company}</p>
              <h3>{internship.title}</h3>
              <p>{internship.description}</p>
              <p className="duration">
                <strong>Duration:</strong> {internship.duration}
              </p>
              <Link className="button-link" to={`/internship/${internship.id}`}>
                View Details
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInternship() {
      try {
        const response = await fetch(`${API_URL}/api/internships/${id}`);
        if (!response.ok) throw new Error("Internship not found.");
        setInternship(await response.json());
      } catch {
        setError("Unable to find this internship.");
      } finally {
        setLoading(false);
      }
    }
    loadInternship();
  }, [id]);

  if (loading) {
    return <main className="container section">Loading details...</main>;
  }

  if (error || !internship) {
    return (
      <main className="container section">
        <p className="error">{error || "Internship not found."}</p>
        <Link to="/">Return home</Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to internships
      </button>

      <article className="details-card">
        <p className="eyebrow">INTERNSHIP OPPORTUNITY</p>
        <h1>{internship.title}</h1>
        <p className="company">{internship.company}</p>
        <p>{internship.description}</p>
        <p><strong>Duration:</strong> {internship.duration}</p>
        <Link className="button-link" to={`/apply/${internship.id}`}>
          Apply Now
        </Link>
      </article>
    </main>
  );
}

function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadInternship() {
      try {
        const response = await fetch(`${API_URL}/api/internships/${id}`);
        if (!response.ok) throw new Error("Internship not found.");
        setInternship(await response.json());
      } catch {
        setError("Unable to find this internship.");
      } finally {
        setLoading(false);
      }
    }
    loadInternship();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!studentName.trim() || !email.trim() || !rollNumber.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          email: email.trim(),
          rollNumber: rollNumber.trim(),
          internship: internship.title,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Application submission failed.");
      }

      setSuccess("Application submitted successfully!");
      setStudentName("");
      setEmail("");
      setRollNumber("");
    } catch (err) {
      setError(err.message || "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="container section">Loading application form...</main>;
  }

  if (!internship) {
    return (
      <main className="container section">
        <p className="error">{error || "Internship not found."}</p>
        <Link to="/">Return home</Link>
      </main>
    );
  }

  return (
    <main className="container section">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <section className="form-card">
        <p className="eyebrow">TAKE THE NEXT STEP</p>
        <h1>Apply for Internship</h1>
        <p className="section-description">{internship.title}</p>

        {success && (
          <div className="success-message" role="status">
            {success}
            <p>
              <Link to="/applications">View submitted applications</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="studentName">Full Name</label>
          <input
            id="studentName"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="rollNumber">Roll Number</label>
          <input
            id="rollNumber"
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter your roll number"
            required
          />

          <label htmlFor="internship">Selected Internship</label>
          <input id="internship" type="text" value={internship.title} readOnly />

          <button className="submit-button" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </section>
    </main>
  );
}

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/applications`);
      if (!response.ok) throw new Error("Could not retrieve applications.");
      setApplications(await response.json());
    } catch {
      setError("Unable to retrieve applications. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <main className="container section">
      <div className="applications-heading">
        <div>
          <p className="eyebrow">STUDENT INTERNSHIP PORTAL</p>
          <h1>Submitted Applications</h1>
          <p className="section-description">
            Applications retrieved from the database.
          </p>
        </div>
        <button
          className="submit-button refresh-button"
          onClick={loadApplications}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Applications"}
        </button>
      </div>

      {!loading && !error && (
        <p className="application-count">
          Total applications: <strong>{applications.length}</strong>
        </p>
      )}

      {loading && <p>Loading applications...</p>}

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button className="retry-button" onClick={loadApplications}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="empty-state">
          <h2>No applications yet</h2>
          <p>Submitted applications will appear here.</p>
          <Link className="button-link" to="/">
            Explore Internships
          </Link>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="applications-grid">
          {applications.map((application) => (
            <article className="application-card" key={application._id}>
              <span className="application-status">Submitted</span>
              <h2>{application.studentName}</h2>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Roll Number:</strong> {application.rollNumber}</p>
              <p><strong>Internship:</strong> {application.internship}</p>
              <p className="application-date">
                <strong>Submitted on:</strong>{" "}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleString()
                  : "Date unavailable"}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function NotFound() {
  return (
    <main className="container section">
      <h1>Page not found</h1>
      <Link to="/">Return to Home</Link>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link className="brand" to="/">
          Intern<span>Connect</span>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/#internships">Internships</Link>
          <Link to="/applications">Applications</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/internship/:id" element={<InternshipDetails />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="site-footer">
        <p>© 2026 InternConnect | Student Internship Portal</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
