// HelixHack 2026 — Supabase Client & Database Layer

const SUPABASE_URL = 'https://tfmtivzgwtvdegcskmzz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kDMT1yPwoQTfvkaJKHuBZQ_smdy_Iur';

// Initialize Supabase client (supabase-js loaded via CDN in HTML)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Google Forms Integration ────────────────────────────────────
// If you want registration data mirrored to Google Sheets via a Google Form,
// replace the placeholder URL and entry IDs with your form's info.
// To find entry IDs: inspect the form source code or use "Get pre-filled link".
const GOOGLE_FORM_CONFIG = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSdlMMTPxuEVpBAbZ8219L3F3SoYfSD3BW5Kd6W1Z7MMq9APgQ/formResponse', // Replace with your Form Response URL
  entries: {
    teamId: 'entry.1400896114',      // Replace with your Form's Team ID field entry ID
    teamName: 'entry.2077303543',    // Replace with your Form's Team Name field entry ID
    school: 'entry.934831932',      // Replace with your Form's School field entry ID
    category: 'entry.1704782608',    // Replace with your Form's Category field entry ID
    theme: 'entry.584403977',       // Replace with your Form's Theme field entry ID
    leaderName: 'entry.1950474762',  // Replace with your Form's Leader Name field entry ID
    leaderEmail: 'entry.399403490', // Replace with your Form's Leader Email field entry ID
    leaderPhone: 'entry.419928691',   // Replace with your Form's Leader Phone field entry ID (e.g. entry.123456789)
    members: 'entry.307412346'      // Replace with your Form's Members list field entry ID
  }
};

// ─── Feature Flags ──────────────────────────────────────────────
class FeatureFlags {
  constructor() {
    this._cache = null;
  }

  async getAll() {
    const { data, error } = await supabaseClient
      .from('feature_flags')
      .select('*');
    if (error) { console.error('FeatureFlags.getAll error:', error); return []; }
    this._cache = data;
    return data;
  }

  async get(key) {
    if (!this._cache) await this.getAll();
    const flag = this._cache?.find(f => f.key === key);
    return flag ? flag.enabled : false;
  }

  async set(key, enabled) {
    const { error } = await supabaseClient
      .from('feature_flags')
      .update({ enabled })
      .eq('key', key);
    if (error) { console.error('FeatureFlags.set error:', error); return false; }
    if (this._cache) {
      const f = this._cache.find(f => f.key === key);
      if (f) f.enabled = enabled;
    }
    return true;
  }
}

// ─── Database Layer ─────────────────────────────────────────────
class HelixSupabase {
  // --- Teams ---
  async getTeams() {
    const { data, error } = await supabaseClient
      .from('teams')
      .select('*, scores(*)')
      .order('created_at', { ascending: false });
    if (error) { console.error('getTeams error:', error); return []; }
    // Flatten scores into team object for backward compat
    return data.map(t => ({
      ...t,
      scores: t.scores || { innovation: 0, stem: 0, feasibility: 0, impact: 0, execution: 0, presentation: 0, bonus: 0, total: 0 }
    }));
  }

  async getTeam(id) {
    const { data, error } = await supabaseClient
      .from('teams')
      .select('*, scores(*)')
      .ilike('id', id.trim())
      .single();
    if (error) { console.error('getTeam error:', error); return null; }

    // Query confirmed days to populate streak
    const confirmedDays = await this.getConfirmedDays(data.id);

    return {
      ...data,
      scores: data.scores || { innovation: 0, stem: 0, feasibility: 0, impact: 0, execution: 0, presentation: 0, bonus: 0, total: 0 },
      confirmedDays: confirmedDays,
      streak: confirmedDays.length
    };
  }

  async getTeamLogs(teamId) {
    const { data, error } = await supabaseClient
      .from('logs')
      .select('*')
      .eq('team_id', teamId)
      .order('date', { ascending: false });
    if (error) { console.error('getTeamLogs error:', error); return []; }
    return data;
  }

  async getConfirmedDays(teamId) {
    const { data, error } = await supabaseClient
      .from('logs')
      .select('date')
      .eq('team_id', teamId)
      .eq('confirmed', true);
    if (error) { console.error('getConfirmedDays error:', error); return []; }
    return data.map(l => l.date);
  }

  // --- Registration ---
  async registerTeam(teamData) {
    const uniqueId = "HH26-" + Math.floor(1000 + Math.random() * 9000);

    // Insert team
    const { error: teamError } = await supabaseClient
      .from('teams')
      .insert({
        id: uniqueId,
        name: teamData.name,
        category: teamData.category,
        theme: teamData.theme,
        school: teamData.school,
        leader_name: teamData.leaderName,
        leader_email: teamData.leaderEmail,
        leader_phone: teamData.leaderPhone || '',
        members: teamData.members,
        submissions: {},
        status: 'registered',
        feedback: 'Your project has been successfully registered. Submit your Round 1 details to begin evaluation.'
      });
    if (teamError) { console.error('registerTeam error:', teamError); return null; }

    // Insert empty scores row
    const { error: scoreError } = await supabaseClient
      .from('scores')
      .insert({ team_id: uniqueId });
    if (scoreError) { console.error('registerTeam scores error:', scoreError); }

    // Mirror to Google Form in the background if configured
    try {
      if (GOOGLE_FORM_CONFIG.url && !GOOGLE_FORM_CONFIG.url.includes('1FAIpQLSfXXXXXXXXXXXXX')) {
        // Google Forms requires application/x-www-form-urlencoded, not multipart/form-data
        const formParams = new URLSearchParams();
        formParams.append(GOOGLE_FORM_CONFIG.entries.teamId, uniqueId);
        formParams.append(GOOGLE_FORM_CONFIG.entries.teamName, teamData.name);
        formParams.append(GOOGLE_FORM_CONFIG.entries.school, teamData.school);
        formParams.append(GOOGLE_FORM_CONFIG.entries.category, teamData.category);
        formParams.append(GOOGLE_FORM_CONFIG.entries.theme, teamData.theme);
        formParams.append(GOOGLE_FORM_CONFIG.entries.leaderName, teamData.leaderName);
        formParams.append(GOOGLE_FORM_CONFIG.entries.leaderEmail, teamData.leaderEmail);
        if (GOOGLE_FORM_CONFIG.entries.leaderPhone && !GOOGLE_FORM_CONFIG.entries.leaderPhone.includes('XXXXXXX')) {
          formParams.append(GOOGLE_FORM_CONFIG.entries.leaderPhone, teamData.leaderPhone);
        }

        // Handle both simple string arrays and object arrays for members safely
        const membersStr = (teamData.members || []).map(m => {
          if (typeof m === 'object' && m !== null) {
            return `${m.name} (${m.email || 'No email'}${m.phone ? `, ${m.phone}` : ''})`;
          }
          return m;
        }).join(', ');

        formParams.append(GOOGLE_FORM_CONFIG.entries.members, membersStr);

        fetch(GOOGLE_FORM_CONFIG.url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formParams.toString()
        }).catch(err => console.warn('Google Form submission network error:', err));
      }
    } catch (err) {
      console.error('Google Form integration error:', err);
    }

    return await this.getTeam(uniqueId);
  }

  // --- Submissions ---
  async submitProject(teamId, type, content) {
    const submission = {
      round1: { type, content, timestamp: new Date().toISOString() }
    };
    const { error } = await supabaseClient
      .from('teams')
      .update({ submissions: submission, status: 'submitted' })
      .eq('id', teamId);
    if (error) { console.error('submitProject error:', error); return false; }
    return true;
  }

  // --- Progress Logs ---
  async addProgressLog(teamId, logText, imageUrl = '') {
    const todayStr = new Date().toISOString().split('T')[0];

    const { error } = await supabaseClient
      .from('logs')
      .insert({
        team_id: teamId,
        date: todayStr,
        text: logText,
        image_url: imageUrl,
        confirmed: false
      });
    if (error) { console.error('addProgressLog error:', error); return null; }

    // Recalculate bonus based on confirmed days
    await this._recalcBonus(teamId);

    return await this.getTeam(teamId);
  }

  // --- Host: Update Team ---
  async updateTeamFromHost(teamId, scores, feedback, status, confirmedDays) {
    // Update scores
    const bonus = Math.min(5, (confirmedDays || []).length);
    const total = (parseInt(scores.innovation) || 0) +
      (parseInt(scores.stem) || 0) +
      (parseInt(scores.feasibility) || 0) +
      (parseInt(scores.impact) || 0) +
      (parseInt(scores.execution) || 0) +
      (parseInt(scores.presentation) || 0) +
      bonus;

    const { error: scoreError } = await supabaseClient
      .from('scores')
      .upsert({
        team_id: teamId,
        innovation: parseInt(scores.innovation) || 0,
        stem: parseInt(scores.stem) || 0,
        feasibility: parseInt(scores.feasibility) || 0,
        impact: parseInt(scores.impact) || 0,
        execution: parseInt(scores.execution) || 0,
        presentation: parseInt(scores.presentation) || 0,
        bonus: bonus,
        total: total
      });
    if (scoreError) console.error('updateTeamFromHost scores error:', scoreError);

    // Update team status and feedback
    const { error: teamError } = await supabaseClient
      .from('teams')
      .update({ feedback: feedback || '', status: status || 'registered' })
      .eq('id', teamId);
    if (teamError) console.error('updateTeamFromHost team error:', teamError);

    // Update log confirmations
    if (confirmedDays && confirmedDays.length > 0) {
      // Reset all to unconfirmed
      await supabaseClient.from('logs').update({ confirmed: false }).eq('team_id', teamId);
      // Confirm the selected days
      for (const day of confirmedDays) {
        await supabaseClient.from('logs').update({ confirmed: true }).eq('team_id', teamId).eq('date', day);
      }
    }

    return await this.getTeam(teamId);
  }

  // --- Leaderboard ---
  async getSchoolCupStandings() {
    const teams = await this.getTeams();
    const schoolStats = {};

    teams.forEach(t => {
      if (t.school && t.school !== 'Independent') {
        if (!schoolStats[t.school]) {
          schoolStats[t.school] = { name: t.school, points: 0, teamCount: 0 };
        }
        schoolStats[t.school].points += t.scores?.total || 0;
        schoolStats[t.school].teamCount += 1;
      }
    });

    return Object.values(schoolStats).sort((a, b) => b.points - a.points);
  }

  // --- Internal: Recalculate bonus ---
  async _recalcBonus(teamId) {
    const confirmed = await this.getConfirmedDays(teamId);
    const bonus = Math.min(5, confirmed.length);

    const { data: currentScores } = await supabaseClient
      .from('scores')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (currentScores) {
      const total = (currentScores.innovation || 0) +
        (currentScores.stem || 0) +
        (currentScores.feasibility || 0) +
        (currentScores.impact || 0) +
        (currentScores.execution || 0) +
        (currentScores.presentation || 0) +
        bonus;

      await supabaseClient
        .from('scores')
        .update({ bonus, total })
        .eq('team_id', teamId);
    }
  }
}

// ─── Feature Flag: DOM Gating ───────────────────────────────────
// Call this on DOMContentLoaded to hide/show elements based on flags
async function applyFeatureFlags() {
  const flags = new FeatureFlags();
  const allFlags = await flags.getAll();

  document.querySelectorAll('[data-feature]').forEach(el => {
    const key = el.getAttribute('data-feature');
    const flag = allFlags.find(f => f.key === key);
    if (flag && !flag.enabled) {
      // Replace content with "Coming Soon" card
      el.innerHTML = `
        <div class="card" style="text-align:center; padding: 4rem 2rem;">
          <span style="font-size:2.5rem;">🔒</span>
          <h3 style="font-family:var(--font-heading); margin: 1rem 0 0.5rem;">Coming Soon</h3>
          <p style="color:var(--color-text-dim);">This section is not yet available. Check back later!</p>
        </div>
      `;
      el.style.pointerEvents = 'none';
    }
  });
}

// ─── Exports ────────────────────────────────────────────────────
const db = new HelixSupabase();
const featureFlags = new FeatureFlags();
