import React, { useState, useEffect } from 'react';
import { fetchSkills, createSkill } from '../api-service';
import { filterSkillsByCategory, calculateTotalCost, matchSkillsToUser } from '../skillswap-functions';
import './App.css';

// Body content created in collaboration with AI chatbots
function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    provider: 'Anonymous' // Default value
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Load skills from the backend API on mount
  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await fetchSkills();
      // Ensure prices are numbers and cards start unexpanded
      const formattedData = data.map(skill => ({
        ...skill,
        price: Number(skill.price) || 0,
        expanded: false
      }));
      setSkills(formattedData);
      setError(null);
    } catch (err) {
      setError('Failed to load skills from server. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSkills();
  }, []);

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.title || !formData.category || formData.price === '' || !formData.description) {
      setFormError('Please fill out all required fields.');
      return;
    }

    try {
      const skillPayload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        provider: formData.provider.trim() || 'Anonymous'
      };

      await createSkill(skillPayload);
      setFormSuccess('Skill created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        price: '',
        description: '',
        provider: 'Anonymous'
      });

      // Reload skills from backend to display the newly created skill
      await loadSkills();
    } catch (err) {
      setFormError('Failed to create skill. Please try again.');
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredSkills = filterSkillsByCategory(skills, selectedCategory);
  
  // Calculator State
  const [calcRate, setCalcRate] = useState('');
  const [calcHours, setCalcHours] = useState('');
  const [totalCost, setTotalCost] = useState(null);

  const handleCalculate = () => {
    const rateNum = parseFloat(calcRate) || 0; // Fallback to 0 if no input value
    const hoursNum = parseFloat(calcHours) || 0; // Fallback to 0 if no input value
    setTotalCost(calculateTotalCost(rateNum, hoursNum));
  };

  // Matcher State
  const [matchCategory, setMatchCategory] = useState('');
  const [matchMaxPrice, setMatchMaxPrice] = useState('');
  const [matchedResults, setMatchedResults] = useState([]);

  const handleMatch = () => {
    const userNeeds = { category: matchCategory.trim(), maxPrice: matchMaxPrice === '' ? Infinity : parseFloat(matchMaxPrice) };
    setMatchedResults(matchSkillsToUser(userNeeds, skills));
  };

  // Function to toggle card expansion on click
  const toggleCard = (id) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, expanded: !skill.expanded } : skill
    ));
  };

  return (
    <div className="app-container">
      {/* Header containing site name and navigation placeholder */}
      <header className="site-header">
        <div className="site-name">Skill Swap</div>
        <nav className="site-nav">
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#browse">Browse Skills</a></li>
            <li><a href="#calculator">Calculator</a></li>
            <li><a href="#matcher">Matcher</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>

      {/* Main content container */}
      <main className="site-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1>Learn, Teach, and Exchange Skills</h1>
          <p>Connect with peer tutors to master new subjects or share your own expertise.</p>
          <a href="#browse" className="btn-primary">Find a Tutor</a>
        </section>

        {/* Skill Offerings Section with Interactive Cards */}
        <section id="browse-skills" className="skill-offerings">
          <h2>Featured Skill Offerings</h2>
          <p className="section-subtitle">Click any card to view more details or book a session.</p>
          
          {/* Filter Buttons */}
          <div className="filter-buttons-group">
            {['All', 'Programming', 'Music', 'Career', 'Language', 'Math'].map(cat => (
              <button key={cat} className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div className="cards-grid">
            {filteredSkills.length === 0 ? (
              <p>No skills found in this category.</p>
            ) : (
              filteredSkills.map(skill => (
              <div 
                key={skill.id} 
                className={`skill-card ${skill.expanded ? 'expanded' : ''}`}
                onClick={() => toggleCard(skill.id)}
              >
                <div className="card-header">
                  <h3>{skill.title}</h3>
                  <span className="card-price">{skill.price}</span>
                </div>
                <p className="card-provider">Tutor: <strong>{skill.provider}</strong></p>
                <p className="card-desc">{skill.description}</p>
                
                {skill.expanded && (
                  <div className="card-extra-details">
                    <hr />
                    <p><strong>Category:</strong> {skill.category}</p>
                    <p><strong>Availability:</strong> Mon, Wed, Fri (4 PM - 7 PM)</p>
                    <button 
                      className="btn-book" 
                      onClick={(e) => { 
                        e.stopPropagation(); // Prevents collapse when clicking button
                        alert(`Booking session for ${skill.title} with ${skill.provider}!`); 
                      }}
                    >
                      Book Session
                    </button>
                  </div>
                )}
                <span className="click-hint">{skill.expanded ? 'Click to collapse' : 'Click for details'}</span>
              </div>
              ))
            )}
          </div>
        </section>

        {/* Add Skill Form Section */}
        <section id="add-skill" className="add-skill-section" style={{ marginTop: '40px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2>Offer a New Skill</h2>
          <p className="section-subtitle">Fill out the form below to add your skill to the database.</p>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <input
              type="text"
              name="title"
              placeholder="Skill Title (e.g. Python Tutoring)"
              value={formData.title}
              onChange={handleInputChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              name="category"
              placeholder="Category (e.g. Programming)"
              value={formData.category}
              onChange={handleInputChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="number"
              name="price"
              placeholder="Hourly Price ($)"
              value={formData.price}
              onChange={handleInputChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              name="provider"
              placeholder="Your Name / Provider"
              value={formData.provider}
              onChange={handleInputChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px', cursor: 'pointer' }}>
              Create Skill
            </button>
            {formError && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{formError}</p>}
            {formSuccess && <p style={{ color: '#28a745', fontWeight: 'bold' }}>{formSuccess}</p>}
          </form>
        </section>

        {/* Cost Calculator Section */}
        <section id="calculator" className="calculator-section">
          <h2>Cost Calculator</h2>
          <p className="section-subtitle">Calculate the total cost for a tutoring session based on hourly rates and hours.</p>
          <div className="input-group">
            <input
              className="calc-input"
              type="number"
              placeholder="Hourly Rate ($)"
              value={calcRate}
              onChange={(e) => setCalcRate(e.target.value)}
            />
            <input
              className="calc-input"
              type="number"
              placeholder="Hours"
              step="0.1"
              value={calcHours}
              onChange={(e) => setCalcHours(e.target.value)}
            />
            <button 
              className="btn-primary calc-btn" 
              onClick={handleCalculate}
            >
              Calculate Total
            </button>
          </div>
          {totalCost !== null && (
            <p className="calc-result">
              Total Cost: ${totalCost.toFixed(2)}
            </p>
          )}
        </section>

        {/* Skill Matcher Section */}
        <section id="matcher" className="matcher-section">
          <h2>Find My Match</h2>
          <p className="section-subtitle">Find skills matching your category preference and maximum price budget.</p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Category (e.g. Programming)"
              value={matchCategory}
              onChange={(e) => setMatchCategory(e.target.value)}
              className="matcher-input"
            />
            <input
              type="number"
              placeholder="Max Price ($)"
              value={matchMaxPrice}
              onChange={(e) => setMatchMaxPrice(e.target.value)}
              className="matcher-input"
            />
            <button 
              className="btn-primary matcher-btn" 
              onClick={handleMatch}
            >
              Find Match
            </button>
          </div>

          <div className="cards-grid matcher-cards-grid">
            {matchedResults.length > 0 ? (
              matchedResults.map((match, idx) => (
                <div key={idx} className="skill-card expanded matcher-card">
                  <div className="card-header">
                    <h3>{match.title}</h3>
                    <span className="card-price">${match.price}/hr</span>
                  </div>
                  <p className="card-provider">Category: <strong>{match.category}</strong></p>
                </div>
              ))
            ) : (
              matchMaxPrice !== '' && <p className="no-match-text">No matching skills found within your budget and category.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer containing placeholder footer content */}
      <footer className="site-footer">
        <p>&copy; 2026 Skill Swap Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;