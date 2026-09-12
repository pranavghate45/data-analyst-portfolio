/**
 * Interactive Data Storytelling Presentation Deck Controller
 */

class StorytellerJS {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSlide = 0;
    this.slides = [];
  }

  init(datasetName, rowsCount, colsCount, topInsights) {
    this.slides = [
      {
        title: "📌 Slide 1: Executive Overview & Scope",
        content: `
          <h3>OmniData Executive Presentation: ${datasetName}</h3>
          <p>This automated data story presents key findings, model performances, and strategic recommendations for <strong>${datasetName}</strong>.</p>
          <div class="kpi-grid" style="margin-top: 1rem;">
            <div class="kpi-card"><div class="kpi-val">${rowsCount.toLocaleString()}</div><div class="kpi-label">Analyzed Records</div></div>
            <div class="kpi-card"><div class="kpi-val">${colsCount}</div><div class="kpi-label">Attributes</div></div>
          </div>
        `
      },
      {
        title: "📈 Slide 2: Key Business Drivers & Correlations",
        content: `
          <h3>Top Analytical Interactions</h3>
          <ul>
            ${topInsights.map(i => `<li>${i}</li>`).join('')}
          </ul>
        `
      },
      {
        title: "💡 Slide 3: Strategic Recommendations",
        content: `
          <h3>Actionable Recommendations for C-Level Stakeholders</h3>
          <ol style="padding-left: 1.2rem;">
            <li>Deploy the AutoML Random Forest production model for predictive scoring.</li>
            <li>Implement targeted customer cohort segmentation using K-Means clustering.</li>
            <li>Monitor real-time anomaly alerts to prevent revenue leakage.</li>
          </ol>
        `
      }
    ];
    this.render();
  }

  render() {
    if (!this.container || this.slides.length === 0) return;
    const slide = this.slides[this.currentSlide];

    this.container.innerHTML = `
      <div class="glass-card" style="padding: 2rem; border-left: 6px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4>${slide.title}</h4>
          <span>Slide ${this.currentSlide + 1} of ${this.slides.length}</span>
        </div>
        <div>${slide.content}</div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button id="btn-prev-slide" class="btn-secondary" ${this.currentSlide === 0 ? 'disabled' : ''}>⬅️ Previous Slide</button>
          <button id="btn-next-slide" class="btn-action" ${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}>Next Slide ➡️</button>
        </div>
      </div>
    `;

    document.getElementById('btn-prev-slide').onclick = () => {
      if (this.currentSlide > 0) {
        this.currentSlide--;
        this.render();
      }
    };

    document.getElementById('btn-next-slide').onclick = () => {
      if (this.currentSlide < this.slides.length - 1) {
        this.currentSlide++;
        this.render();
      }
    };
  }
}
