/*
 * GroundLevel · UK Legal Research plugin for Obsidian
 * MIT · @sjgant80-hub · v0.1.0
 *
 * Single-file CommonJS plugin · no build step · no network calls by default.
 * The full SDK engines are inlined below so the plugin works offline.
 *
 * Commands (run via Ctrl/Cmd+P → "GroundLevel: ..."):
 *   · Search cases at cursor      → modal · pick case(s) · insert as markdown
 *   · Run weave on selection      → 7-strand table dropped at cursor
 *   · Score risk on selection     → STRONG/MODERATE/WEAK/INADVISABLE badge
 *   · Draft court document        → modal · type + facts → full draft inserted
 *   · Audit compliance posture    → modal form → gaps + score inserted
 *   · Insert case by ID           → quick pick · drop one cited authority
 */

'use strict';

const obsidian = require('obsidian');

// ═════════════════════════════════════════════════════════════
// INLINED SDK · same data + engines as @sjgant80-hub/groundlevel-sdk
// (kept here so plugin works without npm + zero deps)
// ═════════════════════════════════════════════════════════════

const CASE_DB = [
  { id:'tiensia-2010',     citation:'Tiensia v Vision Enterprises Ltd [2010] EWCA Civ 1224', court:'Court of Appeal', year:2010, area:'housing',      sub:'deposit',         summary:'Landlord who fails to protect tenant deposit must repay 1-3x the deposit.',                                              principle:'Strict liability for non-protection of deposit.',                       statute:'Housing Act 2004 ss.213-215',                                       tags:['deposit','landlord','tenant','penalty'],         outcome:'tenant',    strands:['HEARTH','EQUITY'] },
  { id:'spencer-taylor-2013', citation:'Spencer v Taylor [2013] EWCA Civ 1600',                   court:'Court of Appeal', year:2013, area:'housing',      sub:'s21',             summary:'Section 21 notice must strictly comply with prescribed form and info.',                                                 principle:'Prescribed information defects invalidate s.21.',                       statute:'Housing Act 1988 s.21 · Deregulation Act 2015',                     tags:['section21','notice','prescribed'],                outcome:'tenant',    strands:['HEARTH','EQUITY'] },
  { id:'caridon-2018',     citation:'Caridon Property Ltd v Monty Shooltz [2018]',               court:'County Court',    year:2018, area:'housing',      sub:'gas_safety',      summary:'Gas Safety Certificate must be provided BEFORE tenant occupation.',                                                       principle:'Pre-tenancy CP12 is non-curable for s.21 purposes.',                    statute:'Gas Safety (Installation & Use) Regs 1998 · Housing Act 1988 s.21A', tags:['gas','safety','section21','cp12'],            outcome:'tenant',    strands:['HEARTH','LIBERTY'] },
  { id:'charalambous-2014',citation:'Charalambous v Maureen Rosairie Ng [2014] EWCA Civ 1604',   court:'Court of Appeal', year:2014, area:'housing',      sub:'deposit',         summary:'Deposit-protection rules apply retrospectively to deposits taken before April 2007 if tenancy continues.',                principle:'Retrospective application of protection scheme rules.',                  statute:'Housing Act 2004',                                                  tags:['deposit','retrospective'],                       outcome:'tenant',    strands:['HEARTH'] },
  { id:'spath-holme-2001', citation:'R (Spath Holme) v SoS [2001] 2 AC 349',                     court:'House of Lords',  year:2001, area:'housing',      sub:'rent_control',    summary:'Limits on ministerial rent-cap powers · housing legislation purpose.',                                                  principle:'Statutory construction · housing legislation purpose.',                  statute:'Landlord & Tenant Act 1985',                                        tags:['rent','statutory','construction'],               outcome:'mixed',     strands:['MAGNA','HEARTH'] },
  { id:'polkey-1987',      citation:'Polkey v AE Dayton Services Ltd [1988] ICR 142',            court:'House of Lords',  year:1987, area:'employment',   sub:'unfair_dismissal',summary:'Procedural unfairness alone is enough to make a dismissal unfair · "Polkey deduction" applies where dismissal fair on proper procedure.', principle:'Procedural fairness · Polkey reduction.',                  statute:'Employment Rights Act 1996 s.98',                                   tags:['unfair','procedure','polkey'],                   outcome:'employee',  strands:['GUILD','EQUITY'] },
  { id:'burchell-1980',    citation:'BHS v Burchell [1980] ICR 303',                             court:'EAT',             year:1980, area:'employment',   sub:'misconduct',      summary:'Three-stage test for misconduct dismissal: genuine belief, reasonable grounds, reasonable investigation.',              principle:'Burchell test for conduct dismissal.',                                   statute:'Employment Rights Act 1996',                                        tags:['misconduct','dismissal','burchell','investigation'], outcome:'employer', strands:['GUILD'] },
  { id:'sayers-2007',      citation:'Sayers v Cambridgeshire CC [2007] IRLR 29',                 court:'EAT',             year:2007, area:'employment',   sub:'whistleblowing',  summary:'Protected disclosure must show reasonable belief that the information tends to show one of six listed categories.',     principle:'Whistleblowing · reasonable-belief test.',                               statute:'Employment Rights Act 1996 ss.43A-43L · PIDA 1998',                tags:['whistleblowing','disclosure','pida'],            outcome:'employee',  strands:['GUILD','LIBERTY','MAGNA'] },
  { id:'addis-1909',       citation:'Addis v Gramophone Co Ltd [1909] AC 488',                   court:'House of Lords',  year:1909, area:'employment',   sub:'damages',         summary:'No damages for hurt feelings or manner of dismissal · only economic loss.',                                              principle:'Addis rule · no damages for injured feelings in contract.',              statute:'Common law',                                                        tags:['damages','feelings','dismissal'],                outcome:'employer',  strands:['GUILD'] },
  { id:'bates-2019',       citation:'Bates v Post Office Ltd [2019] EWHC 606 (QB)',              court:'High Court',      year:2019, area:'employment',   sub:'horizon',         summary:'Mass injustice via Horizon IT · institutional concealment of evidence.',                                                 principle:'Disclosure defeats institutional denial · pattern evidence.',           statute:'CPR Part 31',                                                       tags:['horizon','postoffice','disclosure','injustice'], outcome:'claimants', strands:['CROWN','GUILD','EQUITY'] },
  { id:'lloyd-2021',       citation:'Lloyd v Google LLC [2021] UKSC 50',                         court:'Supreme Court',   year:2021, area:'data',         sub:'class_action',    summary:'No representative action for "loss of control" GDPR damages without proof of individual damage per Art 82.',           principle:'GDPR Art 82 needs individualised damage.',                              statute:'UK GDPR · Data Protection Act 2018',                                tags:['gdpr','damages','classaction','art82'],         outcome:'defendant', strands:['LIBERTY','EQUITY'] },
  { id:'vidal-hall-2015',  citation:'Vidal-Hall v Google [2015] EWCA Civ 311',                   court:'Court of Appeal', year:2015, area:'data',         sub:'misuse_info',     summary:'Misuse of private information is a tort distinct from breach of confidence · damages for distress without pecuniary loss.', principle:'Misuse-of-private-info tort · distress damages.',                    statute:'Common law · DPA 1998 · ECHR Art 8',                                tags:['privacy','misuse','distress','tort'],            outcome:'claimant',  strands:['LIBERTY','EQUITY'] },
  { id:'bridges-2020',     citation:'R (Bridges) v Chief Constable SWP [2020] EWCA Civ 1058',    court:'Court of Appeal', year:2020, area:'data',         sub:'facial_rec',      summary:'Automated facial recognition unlawful · insufficient legal framework + Art 8 + PSED breach.',                          principle:'Biometric processing needs clear legal basis.',                          statute:'DPA 2018 ss.35-42 · ECHR Art 8 · Equality Act 2010',               tags:['facialrec','biometric','art8','psed'],          outcome:'claimant',  strands:['LIBERTY','MAGNA','CROWN'] },
  { id:'schrems-ii-2020',  citation:'Case C-311/18 Schrems II [2020]',                           court:'CJEU',            year:2020, area:'data',         sub:'cross_border',    summary:'EU-US Privacy Shield invalid · SCCs valid only with case-by-case adequacy assessment.',                                principle:'Adequacy + TIA required for cross-border transfers.',                    statute:'GDPR Art 44-49',                                                    tags:['scc','transfer','adequacy','schrems'],          outcome:'claimant',  strands:['LIBERTY','ADMIRALTY'] },
  { id:'morrisons-2020',   citation:'Various Claimants v WM Morrisons [2020] UKSC 12',           court:'Supreme Court',   year:2020, area:'data',         sub:'vicarious',       summary:'Employer not vicariously liable for rogue employee data leak where employee acted on personal vendetta.',               principle:'Vicarious liability · close-connection test.',                          statute:'DPA 1998 · common law',                                             tags:['vicarious','breach','rogue'],                    outcome:'defendant', strands:['GUILD','EQUITY'] },
  { id:'plevin-2014',      citation:'Plevin v Paragon Personal Finance [2014] UKSC 61',          court:'Supreme Court',   year:2014, area:'consumer',     sub:'unfair_relationship', summary:'Non-disclosure of commission on PPI is unfair relationship under s.140A CCA.',                                       principle:'Unfair-relationship test · commission disclosure.',                     statute:'Consumer Credit Act 1974 s.140A',                                   tags:['ppi','commission','unfair','credit'],           outcome:'consumer',  strands:['EQUITY','GUILD'] },
  { id:'oft-2009',         citation:'OFT v Abbey National plc [2009] UKSC 6',                    court:'Supreme Court',   year:2009, area:'consumer',     sub:'unfair_terms',    summary:'Bank overdraft charges are core terms · not assessable for fairness under reg 6(2) UTCCR.',                            principle:'Core terms exclusion · UTCCR (now CRA Part 2).',                        statute:'Consumer Rights Act 2015 ss.62-68',                                 tags:['unfairterms','bank','overdraft','core'],        outcome:'defendant', strands:['EQUITY','GUILD'] },
  { id:'parkingeye-2015',  citation:'ParkingEye v Beavis [2015] UKSC 67',                        court:'Supreme Court',   year:2015, area:'consumer',     sub:'penalty',         summary:'Modern penalty doctrine · clauses not penalties if they protect legitimate interest and are proportionate.',           principle:'Penalty doctrine · legitimate interest + proportionality.',             statute:'Consumer Rights Act 2015 · common law',                            tags:['penalty','parking','clause','legitimate'],      outcome:'mixed',     strands:['EQUITY','GUILD'] },
  { id:'bairstow-2004',    citation:'Bairstow Eves v Smith [2004] EWHC 263',                     court:'High Court',      year:2004, area:'consumer',     sub:'estate_agent',    summary:'Hidden commissions in estate agent transactions · duty to disclose.',                                                    principle:'Fiduciary disclosure · estate agents.',                                 statute:'Estate Agents Act 1979',                                            tags:['estate','commission','disclosure'],              outcome:'consumer',  strands:['EQUITY','GUILD'] },
  { id:'mellor-2020',      citation:'Mellor v Carfin Property Investments [2020]',               court:'County Court',    year:2020, area:'money',        sub:'lba',             summary:'County Court enforced strict PAP-Debt · costs penalty for non-compliance.',                                              principle:'PAP-Debt compliance · costs consequences.',                              statute:'CPR PD-PACP · PAP Debt 2017',                                       tags:['lba','protocol','costs','debt'],                outcome:'claimant',  strands:['EQUITY','GUILD'] },
  { id:'henderson-1843',   citation:'Henderson v Henderson [1843] 3 Hare 100',                    court:'Court of Chancery', year:1843, area:'court',      sub:'res_judicata',    summary:'Bring all claims in one action · estoppel against later litigation of issues that could have been raised.',             principle:'Henderson rule · estoppel by issue.',                                   statute:'Common law',                                                        tags:['estoppel','resjudicata','henderson'],          outcome:'rule',      strands:['EQUITY','CROWN'] },
  { id:'halsey-2004',      citation:'Halsey v Milton Keynes General NHS Trust [2004] EWCA Civ 576', court:'Court of Appeal', year:2004, area:'court',     sub:'adr',             summary:'Courts cannot compel ADR · unreasonable refusal of mediation may lead to cost sanctions.',                             principle:'ADR · voluntary but costs-sanctioned if refused unreasonably.',         statute:'CPR Part 44',                                                       tags:['adr','mediation','costs','halsey'],            outcome:'rule',      strands:['EQUITY','CROWN'] },
  { id:'mitchell-2013',    citation:'Mitchell v News Group Newspapers [2013] EWCA Civ 1537',     court:'Court of Appeal', year:2013, area:'court',        sub:'relief_sanctions',summary:'Strict approach to relief from sanctions under CPR r.3.9.',                                                              principle:'CPR 3.9 · Mitchell test for relief.',                                    statute:'CPR r.3.9',                                                         tags:['sanctions','relief','3.9'],                     outcome:'rule',      strands:['CROWN','EQUITY'] },
  { id:'denton-2014',      citation:'Denton v TH White Ltd [2014] EWCA Civ 906',                 court:'Court of Appeal', year:2014, area:'court',        sub:'relief_sanctions',summary:'Three-stage test refines Mitchell: seriousness, reason, all circumstances.',                                          principle:'Denton test · structured relief.',                                       statute:'CPR r.3.9',                                                         tags:['sanctions','denton','relief'],                   outcome:'rule',      strands:['CROWN','EQUITY'] },
  { id:'fbu-1995',         citation:'R v SoS Home Dept, ex p Fire Brigades Union [1995] 2 AC 513', court:'House of Lords',year:1995, area:'public',       sub:'royal_prerogative', summary:'Royal prerogative cannot be used to undermine statutory schemes.',                                                   principle:'Prerogative subordinate to statute.',                                    statute:'Common law constitutional',                                         tags:['prerogative','statute','fbu'],                  outcome:'claimant',  strands:['MAGNA','CROWN'] },
  { id:'wandsworth-1985',  citation:'Wandsworth LBC v Winder [1985] AC 461',                     court:'House of Lords',  year:1985, area:'public',       sub:'collateral_attack', summary:'Defendant can challenge public-law decision as defence to private-law action · "Winder defence".',                  principle:'Collateral attack permitted as defence.',                                statute:'Common law',                                                        tags:['collateral','public','winder'],                  outcome:'rule',      strands:['MAGNA','EQUITY'] },
  { id:'owusu-2005',       citation:'Owusu v Jackson C-281/02 [2005]',                            court:'CJEU',            year:2005, area:'international',sub:'jurisdiction',    summary:'Court cannot decline jurisdiction in favour of non-EU forum where Brussels I applies.',                                principle:'Brussels I forum mandatory.',                                            statute:'Brussels Recast Regulation 1215/2012',                              tags:['jurisdiction','brussels','forum'],              outcome:'rule',      strands:['ADMIRALTY','MAGNA'] },
  { id:'eu-ai-act-2024',   citation:'EU AI Act (Regulation 2024/1689)',                          court:'EU',              year:2024, area:'data',         sub:'ai_act',          summary:'Risk-tiered AI · Art 12 logging · Art 50 transparency · Annex IV documentation.',                                       principle:'AI risk tiering · provider/deployer duties.',                            statute:'Regulation (EU) 2024/1689',                                         tags:['ai','euact','article12','annex4'],              outcome:'rule',      strands:['MAGNA','LIBERTY','CROWN'] },
];

const WEAVE_PATTERNS = {
  unfair_dismissal: { strands: { CROWN:0.7, EQUITY:0.9, GUILD:1.0, LIBERTY:0.4 }, keywords: ['unfair','dismissal','redundancy','misconduct','procedure'] },
  deposit_dispute:  { strands: { HEARTH:1.0, EQUITY:0.8, MAGNA:0.3 },             keywords: ['deposit','protection','tenancy','landlord','tds','mydeposits','dps'] },
  gdpr_breach:      { strands: { LIBERTY:1.0, EQUITY:0.7, CROWN:0.5, ADMIRALTY:0.4 }, keywords: ['gdpr','data','breach','dsar','ico','art8'] },
  consumer_refund:  { strands: { EQUITY:1.0, GUILD:0.8 },                          keywords: ['consumer','refund','cra','section75','chargeback'] },
  whistleblowing:   { strands: { GUILD:1.0, LIBERTY:0.9, MAGNA:0.7, CROWN:0.5 }, keywords: ['whistleblowing','pida','disclosure','protected'] },
  platform_unpaid:  { strands: { GUILD:1.0, EQUITY:0.8, ADMIRALTY:0.5 },          keywords: ['platform','freelancer','unpaid','invoice','lba'] },
  frozen_account:   { strands: { EQUITY:0.9, GUILD:0.8, ADMIRALTY:0.6, CROWN:0.5 }, keywords: ['frozen','paypal','fos','cfpb','payment','processor'] },
  illegal_eviction: { strands: { HEARTH:1.0, CROWN:0.8, LIBERTY:0.7 },             keywords: ['eviction','illegal','pea1977','harassment'] },
  discrimination:   { strands: { GUILD:0.9, EQUITY:1.0, MAGNA:0.6, LIBERTY:0.6 },  keywords: ['discrimination','equality','protected','characteristic'] },
  subscription_trap:{ strands: { EQUITY:1.0, GUILD:0.6 },                          keywords: ['subscription','autorenewal','cancel','ccrs2013'] },
};

const WEAVE_STRANDS = [
  { name:'MAGNA',     icon:'⚖', angle:'Constitutional / fundamental rights' },
  { name:'LIBERTY',   icon:'🕊', angle:'Personal liberty / privacy' },
  { name:'CROWN',     icon:'👑', angle:'Criminal / regulatory' },
  { name:'EQUITY',    icon:'⚪', angle:'Fairness / conscience / equitable remedies' },
  { name:'HEARTH',    icon:'🏠', angle:'Housing / family / welfare' },
  { name:'GUILD',     icon:'⚒', angle:'Employment / commercial / trade' },
  { name:'ADMIRALTY', icon:'⚓', angle:'Cross-border / maritime / international' },
];

const PATTERN_KEYS = Object.keys(WEAVE_PATTERNS);
const AREAS = [...new Set(CASE_DB.map(c => c.area))].sort();

function searchCases(query, areaFilter, opts) {
  opts = opts || {};
  const limit = opts.limit || 8;
  if (!query) return [];
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const pool = areaFilter ? CASE_DB.filter(c => c.area === areaFilter) : CASE_DB;
  return pool.map(c => {
    let score = 0;
    const haystack = (c.summary + ' ' + c.principle + ' ' + (c.tags || []).join(' ') + ' ' + (c.statute || '') + ' ' + c.sub).toLowerCase();
    terms.forEach(t => {
      if (haystack.includes(t)) score += 2;
      if ((c.tags || []).some(tag => tag.includes(t))) score += 3;
      if (c.principle.toLowerCase().includes(t)) score += 3;
    });
    return Object.assign({}, c, { _score: score });
  }).filter(c => c._score > 0).sort((a, b) => b._score - a._score).slice(0, limit);
}

function scoreCaseAgainst(c, query, pattern) {
  let s = 0;
  const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const hay = (c.summary + ' ' + c.principle + ' ' + (c.tags || []).join(' ')).toLowerCase();
  terms.forEach(t => { if (hay.includes(t)) s += 2; });
  if (pattern && pattern.keywords) {
    pattern.keywords.forEach(k => { if (hay.includes(k.toLowerCase())) s += 1; });
  }
  return s;
}

function runWeave(query, patternKey, opts) {
  opts = opts || {};
  const perStrand = opts.perStrand || 4;
  const pattern = WEAVE_PATTERNS[patternKey] || null;
  const results = WEAVE_STRANDS.map(strand => {
    const weight = pattern ? (pattern.strands[strand.name] || 0) : 1;
    const cases = CASE_DB
      .filter(c => (c.strands || []).includes(strand.name))
      .map(c => Object.assign({}, c, { _score: scoreCaseAgainst(c, query, pattern) * weight }))
      .filter(c => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, perStrand);
    return { strand: strand.name, icon: strand.icon, angle: strand.angle, cases, weight };
  });

  const contradictions = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const ai = results[i].cases[0], aj = results[j].cases[0];
      if (ai && aj && ai.area === aj.area && ai.outcome !== aj.outcome && ai.outcome !== 'rule' && aj.outcome !== 'rule') {
        contradictions.push({ a: results[i].strand, b: results[j].strand, area: ai.area });
      }
    }
  }
  return { results, contradictions };
}

function scoreRisk(weaveResult) {
  const tops = (weaveResult.results || []).map(r => (r.cases[0] && r.cases[0]._score) || 0);
  const avg = tops.length ? tops.reduce((a, b) => a + b, 0) / tops.length : 0;
  let pct = Math.min(100, Math.round(avg * 8));
  pct -= (weaveResult.contradictions || []).length * 8;
  pct = Math.max(0, pct);
  let label, recommendation;
  if (pct >= 70)      { label = 'STRONG';      recommendation = 'Clear legal basis. Proceed with appropriate letter/template. Estimated success 70-95%.'; }
  else if (pct >= 40) { label = 'MODERATE';    recommendation = 'Arguable case. Gather additional evidence before formal action. Estimated success 40-65%.'; }
  else if (pct >= 10) { label = 'WEAK';        recommendation = 'Uphill battle. ADR preferred over litigation. Estimated success 15-35%.'; }
  else                { label = 'INADVISABLE'; recommendation = 'Unlikely to succeed on the facts. Seek professional legal advice before any irreversible step.'; }
  return { pct, label, recommendation };
}

const DOC_TYPES = ['particulars_claim','witness_statement','skeleton_argument','position_statement','legal_brief','compliance_report','due_diligence'];

function draftDocument(input) {
  const type = input.type || 'legal_brief';
  const facts = input.facts || '';
  const parties = input.parties || '[Claimant] v [Defendant]';
  const court = input.court || 'COUNTY COURT';
  const relief = input.relief || '[set out the orders sought]';
  const cases = searchCases(facts, undefined, { limit: 4 });
  const citationList = cases.map(c => `· ${c.citation} — ${c.principle}`).join('\n');
  const today = new Date().toISOString().slice(0, 10);

  const FORMATS = {
    particulars_claim:  `IN THE ${court}\n\nBETWEEN:\n${parties}\n\nPARTICULARS OF CLAIM\n\n${facts.split('\n').map(l => l.trim()).filter(Boolean).map((l,i) => `${i+1}. ${l}`).join('\n\n')}\n\nRELIEF SOUGHT\n\n${relief}\n\nCITED AUTHORITIES\n${citationList}\n\nSTATEMENT OF TRUTH\nI believe the facts stated in these Particulars are true.\n\nSigned: ___________ Date: ${today}`,
    witness_statement:  `IN THE ${court}\n\n${parties}\n\nWITNESS STATEMENT OF [YOUR NAME]\n\nI, [your name], of [your address], state as follows:\n\n${facts.split('\n').map((l,i) => `${i+1}. ${l.trim()}`).filter(p => p.trim()).join('\n\n')}\n\nSTATEMENT OF TRUTH\nI believe the facts stated in this witness statement are true.\n\nSigned: ___________ Date: ${today}`,
    skeleton_argument:  `SKELETON ARGUMENT\n\nFor: ${parties}\nBefore: ${court}\n\nINTRODUCTION\n[set out the issue]\n\nFACTS\n${facts}\n\nLAW\n${citationList}\n\nSUBMISSIONS\n[1] [based on leading authority above]\n[2] [responding to anticipated counter-argument]\n[3] [relief sought and proportionality]\n\nCONCLUSION\nFor the reasons above, [the desired outcome] is invited.\n\nDated: ${today}`,
    position_statement: `POSITION STATEMENT\n\nFrom: ${parties}\nProvided for: ${court}\n\nBACKGROUND\n${facts.split('\n').slice(0, 6).join('\n')}\n\nKEY ISSUES\n· [Issue 1]\n· [Issue 2]\n· [Issue 3]\n\nOUR POSITION\nWe believe the most likely just outcome is: ${relief}.\n\nRELEVANT AUTHORITIES\n${citationList}\n\nDated: ${today}`,
    legal_brief:        `LEGAL BRIEF · ADVISORY\n\nClient: [name]\nDate: ${today}\nMatter: ${court}\n\nFACTS\n${facts}\n\nAPPLICABLE LAW\n${citationList}\n\nANALYSIS\n[where the law applied to these facts leads]\n\nRECOMMENDED ACTION\n${relief}\n\nRISKS / OPEN QUESTIONS\n· [strongest counter-argument]\n· [evidence gap]\n\nDISCLAIMER: draft advisory · not legal advice · attorney review required.`,
    compliance_report:  `COMPLIANCE POSTURE REPORT\n\nClient: [name]\nDate: ${today}\nFrameworks: UK GDPR · EU AI Act · CRA 2015 · ERA 1996\n\nEXECUTIVE SUMMARY\n[posture in 3 sentences]\n\nKEY GAPS\n[populated by audit_compliance]\n\nREMEDIATION ROADMAP\n· Immediate (≤30d) · [item]\n· Near-term (1-3m) · [item]\n· Strategic (3-12m) · [item]\n\nCITED AUTHORITIES\n${citationList}\n\nDated: ${today}`,
    due_diligence:      `DUE DILIGENCE SUMMARY\n\nTarget: [name]\nScope: ${facts.slice(0, 200)}\nDate: ${today}\n\nFINDINGS\n${facts}\n\nLEGAL RISK SUMMARY\n${citationList}\n\nFLAGS\n· [material flag 1]\n· [material flag 2]\n\nRECOMMENDED CONDITIONS\n· [warranty / indemnity / escrow]\n\nDated: ${today}`,
  };
  return { draft: FORMATS[type] || FORMATS.legal_brief, citations: cases };
}

const COMPLIANCE_RULES = [
  { id:'uk_gdpr_dpa',          framework:'UK GDPR / DPA 2018',           check: v => v.ca_jurisdiction !== 'us' && (!v.ca_dpa || v.ca_dpa === 'no'),                                                                                                  severity:'high',   gap:'No Data Processing Agreements with sub-processors · Art 28 UK GDPR breach.',          remedy:'Execute DPA with all sub-processors.' },
  { id:'uk_gdpr_pp',           framework:'UK GDPR / DPA 2018',           check: v => v.ca_jurisdiction !== 'us' && (v.ca_privacy_policy === 'no' || v.ca_privacy_policy === 'stale'),                                                                  severity:'high',   gap:'Privacy policy missing or stale (>12 months).',                                       remedy:'Publish a reviewed privacy policy within 14 days.' },
  { id:'uk_gdpr_dsar',         framework:'UK GDPR / DPA 2018',           check: v => v.ca_jurisdiction !== 'us' && v.ca_personal_data !== 'none' && (v.ca_dsar_process === 'no' || v.ca_dsar_process === 'informal'),                                  severity:'medium', gap:'No documented DSAR response process · 1-month deadline at risk.',                     remedy:'Document a DSAR workflow + internal checklist.' },
  { id:'uk_gdpr_records',      framework:'UK GDPR Art 30',               check: v => v.ca_size !== '1' && v.ca_size !== '2-9' && v.ca_records !== 'yes',                                                                                                severity:'medium', gap:'No Article 30 record of processing activities.',                                      remedy:'Build ROPA template.' },
  { id:'eu_ai_act_audit',      framework:'EU AI Act Art 12',             check: v => v.ca_uses_ai === 'yes' && (v.ca_eu_users === 'yes' || v.ca_eu_users === 'maybe') && v.ca_audit_log !== 'yes',                                                       severity:'high',   gap:'AI in production with EU users, no Art 12 audit logging chain. Required Aug 2 2026.', remedy:'Install fall-euaiact audit-shim or equivalent.' },
  { id:'eu_ai_act_planning',   framework:'EU AI Act planning',           check: v => v.ca_uses_ai === 'planning' && (v.ca_eu_users === 'yes' || v.ca_eu_users === 'maybe'),                                                                              severity:'medium', gap:'AI planned with EU exposure. Art 12 + Annex IV + Art 50 attach BEFORE launch.',       remedy:'Plan Article 12 audit shim + Annex IV docs pre-launch.' },
  { id:'employment_contracts', framework:'Employment Rights Act 1996',   check: v => v.ca_employment_contracts === 'no' && v.ca_size !== '1',                                                                                                            severity:'high',   gap:'No written employment particulars (ERA s.1).',                                        remedy:'Issue s.1 statements within 14 days.' },
  { id:'employment_handbook',  framework:'ACAS Code',                    check: v => v.ca_size !== '1' && v.ca_size !== '2-9' && v.ca_handbook === 'no',                                                                                                 severity:'medium', gap:'No employee handbook / grievance procedure. ACAS uplift risk ±25%.',                  remedy:'Publish grievance procedure.' },
  { id:'cra_terms',            framework:'Consumer Rights Act 2015',     check: v => v.ca_t_and_c === 'never',                                                                                                                                            severity:'medium', gap:'Consumer T&Cs never reviewed against CRA 2015 Part 2.',                               remedy:'Run unfair-terms checklist.' },
  { id:'cra_subscription',     framework:'CCRs 2013',                    check: v => v.ca_subscription === 'yes',                                                                                                                                         severity:'medium', gap:'Auto-renewing subscriptions trigger CCRs 2013 disclosure + cancellation duties.',     remedy:'Add disclosure + cancellation flow.' },
  { id:'breach_plan',          framework:'UK GDPR · DPA 2018',           check: v => v.ca_personal_data !== 'none' && (v.ca_breach_plan === 'no'),                                                                                                       severity:'high',   gap:'No data breach response plan · 72-hour reporting at risk.',                           remedy:'Build breach playbook.' },
  { id:'health_safety',        framework:'Health & Safety at Work 1974', check: v => (v.ca_size === '10-49' || v.ca_size === '50-249' || v.ca_size === '250+') && v.ca_health_safety === 'no',                                                            severity:'high',   gap:'Written H&S policy required if 5+ employees.',                                        remedy:'Draft H&S policy.' },
  { id:'cyber_incident',       framework:'UK GDPR · DPA 2018',           check: v => v.ca_cyber === 'incident' && v.ca_breach_plan !== 'yes',                                                                                                              severity:'high',   gap:'Cyber incident occurred AND no breach plan. Material risk.',                          remedy:'Engage incident response specialist + plan playbook this week.' },
];

function auditCompliance(vars) {
  const gaps = COMPLIANCE_RULES.filter(r => r.check(vars || {}));
  const score = Math.max(0, 100 - gaps.reduce((s, g) => s + ({ high: 15, medium: 8, low: 3 }[g.severity] || 5), 0));
  return { gaps, score };
}

// ═════════════════════════════════════════════════════════════
// markdown formatters · how each engine renders into the note
// ═════════════════════════════════════════════════════════════

function caseToMarkdown(c) {
  return `> **${c.citation}** · ${c.court} · ${c.year}\n> *${c.area}/${c.sub}* — ${c.principle}\n> Statute: ${c.statute || '—'}`;
}

function casesToList(hits) {
  return hits.map((c, i) => `${i + 1}. **${c.citation}** — ${c.principle} *(${c.area}/${c.sub})*`).join('\n');
}

function weaveToMarkdown(query, weave) {
  let out = `\n## ◊ Weave · ${query}\n\n`;
  out += `| Strand | Weight | Top authority |\n|---|---|---|\n`;
  weave.results.forEach(r => {
    const top = r.cases[0];
    out += `| ${r.icon} ${r.strand} | ${r.weight.toFixed(1)} | ${top ? top.citation + ' — ' + top.principle : '—'} |\n`;
  });
  if (weave.contradictions.length > 0) {
    out += `\n**Contradictions detected:** ${weave.contradictions.map(c => `${c.a} vs ${c.b} (${c.area})`).join(' · ')}\n`;
  }
  return out + '\n';
}

function riskToMarkdown(query, risk) {
  return `\n> **Risk: ${risk.label} · ${risk.pct}%** — *${query}*\n> ${risk.recommendation}\n\n`;
}

function complianceToMarkdown(result) {
  let out = `\n## ◊ Compliance Audit · Score ${result.score}/100\n\n`;
  if (result.gaps.length === 0) {
    out += `_No gaps detected against the configured rule set._\n\n`;
  } else {
    out += `| Severity | Framework | Gap | Remedy |\n|---|---|---|---|\n`;
    result.gaps.forEach(g => {
      out += `| ${g.severity} | ${g.framework} | ${g.gap.replace(/\|/g,'\\|')} | ${g.remedy.replace(/\|/g,'\\|')} |\n`;
    });
  }
  out += `\n_Generated by GroundLevel · not legal advice._\n\n`;
  return out;
}

// ═════════════════════════════════════════════════════════════
// modals
// ═════════════════════════════════════════════════════════════

class SearchModal extends obsidian.Modal {
  constructor(app, onPick) {
    super(app);
    this.onPick = onPick;
    this.area = '';
    this.selected = new Set();
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '◊ Search UK cases' });

    const inputRow = contentEl.createDiv({ cls: 'gl-row' });
    const q = inputRow.createEl('input', { type: 'text', placeholder: 'describe the situation · 3-10 words' });
    q.style.width = '70%';
    const areaSel = inputRow.createEl('select');
    areaSel.style.marginLeft = '8px';
    areaSel.createEl('option', { text: 'all areas', value: '' });
    AREAS.forEach(a => areaSel.createEl('option', { text: a, value: a }));

    const results = contentEl.createDiv({ cls: 'gl-results' });
    const render = () => {
      const hits = searchCases(q.value, areaSel.value || undefined);
      results.empty();
      if (!q.value) { results.createEl('div', { text: 'start typing…', cls: 'gl-dim' }); return; }
      if (hits.length === 0) { results.createEl('div', { text: 'no hits', cls: 'gl-dim' }); return; }
      hits.forEach(c => {
        const row = results.createDiv({ cls: 'gl-hit' });
        const cb = row.createEl('input', { type: 'checkbox' });
        cb.id = `cb-${c.id}`;
        if (this.selected.has(c.id)) cb.checked = true;
        cb.addEventListener('change', () => {
          if (cb.checked) this.selected.add(c.id);
          else this.selected.delete(c.id);
        });
        const label = row.createEl('label', { attr: { for: `cb-${c.id}` } });
        label.createEl('div', { text: c.citation, cls: 'gl-cite' });
        label.createEl('div', { text: `${c.area}/${c.sub} · ${c.court} · ${c.year}`, cls: 'gl-meta' });
        label.createEl('div', { text: c.principle, cls: 'gl-prin' });
      });
    };
    q.addEventListener('input', render);
    areaSel.addEventListener('change', render);
    setTimeout(() => q.focus(), 50);

    const actions = contentEl.createDiv({ cls: 'gl-actions' });
    const insertBtn = actions.createEl('button', { text: 'Insert at cursor', cls: 'mod-cta' });
    insertBtn.addEventListener('click', () => {
      const picked = [...this.selected].map(id => CASE_DB.find(c => c.id === id)).filter(Boolean);
      if (picked.length === 0) {
        new obsidian.Notice('select at least one case');
        return;
      }
      this.onPick(picked);
      this.close();
    });

    render();
  }
  onClose() { this.contentEl.empty(); }
}

class DraftModal extends obsidian.Modal {
  constructor(app, onDraft) { super(app); this.onDraft = onDraft; }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '◊ Draft court document' });

    const grid = contentEl.createDiv({ cls: 'gl-grid' });
    const typeSel = grid.createEl('select');
    DOC_TYPES.forEach(t => typeSel.createEl('option', { text: t, value: t }));
    typeSel.value = 'legal_brief';

    const parties = grid.createEl('input', { type: 'text', placeholder: 'parties (e.g. Smith v Acme Ltd)' });
    const court   = grid.createEl('input', { type: 'text', placeholder: 'court / tribunal' });
    const relief  = grid.createEl('input', { type: 'text', placeholder: 'relief sought' });
    const facts   = contentEl.createEl('textarea', { attr: { placeholder: 'facts · one paragraph per line', rows: 8 } });
    facts.style.width = '100%';

    const actions = contentEl.createDiv({ cls: 'gl-actions' });
    actions.createEl('button', { text: 'Insert draft', cls: 'mod-cta' }).addEventListener('click', () => {
      if (!facts.value.trim()) { new obsidian.Notice('add at least one fact'); return; }
      const { draft, citations } = draftDocument({ type: typeSel.value, facts: facts.value, parties: parties.value, court: court.value, relief: relief.value });
      this.onDraft(draft, citations);
      this.close();
    });
  }
  onClose() { this.contentEl.empty(); }
}

class AuditModal extends obsidian.Modal {
  constructor(app, onAudit) { super(app); this.onAudit = onAudit; }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: '◊ Compliance posture audit' });

    const fields = [
      ['ca_size', 'Size', ['1','2-9','10-49','50-249','250+']],
      ['ca_personal_data', 'Personal data', ['none','minimal','standard','sensitive']],
      ['ca_uses_ai', 'Uses AI', ['no','planning','yes']],
      ['ca_eu_users', 'EU users', ['no','maybe','yes']],
      ['ca_audit_log', 'Art 12 audit log', ['yes','no']],
      ['ca_dpa', 'DPAs with sub-processors', ['yes','no']],
      ['ca_privacy_policy', 'Privacy policy', ['yes','stale','no']],
      ['ca_dsar_process', 'DSAR process', ['documented','informal','no']],
      ['ca_breach_plan', 'Breach response plan', ['yes','no']],
      ['ca_employment_contracts', 'Written contracts', ['yes','no']],
      ['ca_handbook', 'Employee handbook', ['yes','no']],
      ['ca_health_safety', 'H&S policy', ['yes','no']],
      ['ca_t_and_c', 'Consumer T&Cs', ['recent','old','never']],
      ['ca_subscription', 'Auto-renewing subs', ['no','yes']],
      ['ca_cyber', 'Cyber posture', ['none','near_miss','incident']],
    ];
    const grid = contentEl.createDiv({ cls: 'gl-grid' });
    const inputs = {};
    fields.forEach(([k, label, opts]) => {
      const w = grid.createDiv();
      w.createEl('label', { text: label, cls: 'gl-meta' });
      const sel = w.createEl('select');
      opts.forEach(o => sel.createEl('option', { text: o, value: o }));
      inputs[k] = sel;
    });
    const actions = contentEl.createDiv({ cls: 'gl-actions' });
    actions.createEl('button', { text: 'Run audit', cls: 'mod-cta' }).addEventListener('click', () => {
      const vars = {};
      Object.entries(inputs).forEach(([k, el]) => vars[k] = el.value);
      const result = auditCompliance(vars);
      this.onAudit(result);
      this.close();
    });
  }
  onClose() { this.contentEl.empty(); }
}

class QueryModal extends obsidian.Modal {
  constructor(app, title, onSubmit) { super(app); this.title = title; this.onSubmit = onSubmit; }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.title });
    const q = contentEl.createEl('input', { type: 'text', placeholder: 'query · 3-10 words' });
    q.style.width = '100%';
    const pSel = contentEl.createEl('select');
    pSel.style.marginTop = '8px';
    pSel.createEl('option', { text: 'no pattern (even weights)', value: '' });
    PATTERN_KEYS.forEach(p => pSel.createEl('option', { text: p, value: p }));
    const actions = contentEl.createDiv({ cls: 'gl-actions' });
    actions.createEl('button', { text: 'Run', cls: 'mod-cta' }).addEventListener('click', () => {
      if (!q.value.trim()) { new obsidian.Notice('enter a query'); return; }
      this.onSubmit(q.value, pSel.value || undefined);
      this.close();
    });
    setTimeout(() => q.focus(), 50);
  }
  onClose() { this.contentEl.empty(); }
}

// ═════════════════════════════════════════════════════════════
// plugin
// ═════════════════════════════════════════════════════════════

class GroundLevelPlugin extends obsidian.Plugin {
  async onload() {
    console.log('◊ GroundLevel · loaded · ' + CASE_DB.length + ' cases · ' + PATTERN_KEYS.length + ' patterns');

    // 1 · Search cases at cursor
    this.addCommand({
      id: 'gl-search-cases',
      name: 'Search UK cases · insert at cursor',
      editorCallback: (editor) => {
        new SearchModal(this.app, (picked) => {
          const md = picked.map(c => caseToMarkdown(c)).join('\n\n');
          editor.replaceSelection(md + '\n');
        }).open();
      },
    });

    // 2 · Run weave on selection
    this.addCommand({
      id: 'gl-weave',
      name: 'Run 7-strand weave',
      editorCallback: (editor) => {
        const sel = editor.getSelection().trim();
        const run = (q, p) => {
          const weave = runWeave(q, p);
          editor.replaceSelection(weaveToMarkdown(q, weave));
        };
        if (sel) {
          new QueryModal(this.app, '◊ Weave: pattern for "' + sel.slice(0, 40) + '"', (_q, p) => run(sel, p)).open();
        } else {
          new QueryModal(this.app, '◊ Weave: query', run).open();
        }
      },
    });

    // 3 · Score risk on selection
    this.addCommand({
      id: 'gl-risk',
      name: 'Score legal risk on selection / query',
      editorCallback: (editor) => {
        const sel = editor.getSelection().trim();
        const run = (q, p) => {
          const w = runWeave(q, p);
          const r = scoreRisk(w);
          editor.replaceSelection(riskToMarkdown(q, r));
        };
        if (sel) {
          new QueryModal(this.app, '◊ Risk: pattern for "' + sel.slice(0, 40) + '"', (_q, p) => run(sel, p)).open();
        } else {
          new QueryModal(this.app, '◊ Risk: query', run).open();
        }
      },
    });

    // 4 · Draft court document
    this.addCommand({
      id: 'gl-draft',
      name: 'Draft court document',
      editorCallback: (editor) => {
        new DraftModal(this.app, (draft, citations) => {
          const cites = citations.length
            ? '\n\n**Cited authorities:**\n' + casesToList(citations) + '\n'
            : '';
          editor.replaceSelection('\n```\n' + draft + '\n```\n' + cites);
        }).open();
      },
    });

    // 5 · Compliance audit
    this.addCommand({
      id: 'gl-audit',
      name: 'Run compliance audit',
      editorCallback: (editor) => {
        new AuditModal(this.app, (result) => {
          editor.replaceSelection(complianceToMarkdown(result));
        }).open();
      },
    });

    // 6 · Quick insert by ID
    this.addCommand({
      id: 'gl-insert-case-by-id',
      name: 'Insert case by ID (quick pick)',
      editorCallback: (editor) => {
        const ids = CASE_DB.map(c => ({ id: c.id, label: c.id + ' · ' + c.citation }));
        const m = new obsidian.SuggestModal(this.app);
        m.getSuggestions = (q) => ids.filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
        m.renderSuggestion = (x, el) => { el.createEl('div', { text: x.label }); };
        m.onChooseSuggestion = (x) => {
          const c = CASE_DB.find(cc => cc.id === x.id);
          if (c) editor.replaceSelection(caseToMarkdown(c) + '\n');
        };
        m.open();
      },
    });

    // ribbon icon
    this.addRibbonIcon('scale', 'GroundLevel · search UK cases', () => {
      new SearchModal(this.app, (picked) => {
        const md = picked.map(c => caseToMarkdown(c)).join('\n\n');
        const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (view && view.editor) view.editor.replaceSelection(md + '\n');
        else new obsidian.Notice('open a markdown note first');
      }).open();
    });
  }

  onunload() {
    console.log('◊ GroundLevel · unloaded');
  }
}

// ═════════════════════════════════════════════════════════════
// exports
// ═════════════════════════════════════════════════════════════

module.exports = GroundLevelPlugin;

// for the test harness (kept out of Obsidian's hot path)
module.exports.__sdk__ = {
  CASE_DB, WEAVE_PATTERNS, WEAVE_STRANDS, AREAS, PATTERN_KEYS, DOC_TYPES, COMPLIANCE_RULES,
  searchCases, runWeave, scoreRisk, draftDocument, auditCompliance,
  caseToMarkdown, casesToList, weaveToMarkdown, riskToMarkdown, complianceToMarkdown,
};
