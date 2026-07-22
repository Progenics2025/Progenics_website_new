// Progenics Labs - Supabase Client Configuration
// IMPORTANT: Replace the URL and Key below with your actual Supabase credentials.

// Core Client Routing Configuration
// To prevent public search indexing and automated credential harvesting, endpoint details are obfuscated.
// To configure, compute the Base64 values of your database URL and Anon key and insert below.
const _routeEndpoint = 'aHR0cHM6Ly9ZT1VSX1BST0pFQ1RfSUQuc3VwYWJhc2UuY28=';
const _routeToken    = 'WU9VUl9BTk9OX1BVQkxJQ19LRVk=';

let SUPABASE_URL = atob(_routeEndpoint);
let SUPABASE_ANON_KEY = atob(_routeToken);

// Check configuration state (detects if default placeholder value is still present)
const isDemoMode = SUPABASE_URL.includes(atob('WU9VUl9QUk9KRUNUX0lE')) || !SUPABASE_URL;

let supabaseClient = null;

if (isDemoMode) {
  // Running in Local Demo Mode — no Supabase credentials configured.
  // Internal system identifier only — not for display.
  SUPABASE_URL = 'http://progenics-demo-mode';
  SUPABASE_ANON_KEY = 'demo-anon-key-123';
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

  // Mock Session Auth storage key
  const AUTH_KEY = 'progenics_mock_session';
  const BLOGS_KEY = 'progenics_mock_blogs';
  const CAREERS_KEY = 'progenics_mock_careers';
  const GALLERY_KEY = 'progenics_mock_gallery';
  const RECYCLE_BIN_KEY = 'progenics_mock_recycle_bin';

  // SHA-256 hash of the admin password — never store plaintext credentials here.
  // To change the password: compute SHA-256 of your new password and update this constant.
  const ADMIN_EMAIL_HASH = 'bd7c8ac40dbeb16f35dba0ab6f26afb72f1f2efa45e9d6aab19cde12651f1e50';
  const ADMIN_PASS_HASH  = '47436218094cb5cb045cdce14e0bc1f2eb0c38c1a15e75fca49b57399a497503';
  // NOTE: These hashes correspond to the admin credentials configured for this portal.
  // You MUST recompute and update these hashes if you change the credentials.

  // Utility: compute SHA-256 using the built-in Web Crypto API
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Keep track of auth state listeners in this tab
  const authListeners = [];

  // Mock Supabase Client API matching the real client's basic syntax
  class MockSupabaseClient {
    constructor() {
      this.auth = {
        getSession: async () => {
          const sessionJson = localStorage.getItem(AUTH_KEY);
          return { data: { session: sessionJson ? JSON.parse(sessionJson) : null }, error: null };
        },
        signInWithPassword: async ({ email, password }) => {
          const emailHash = await sha256(email.toLowerCase().trim());
          const passHash  = await sha256(password);
          if (emailHash === ADMIN_EMAIL_HASH && passHash === ADMIN_PASS_HASH) {
            const mockSession = {
              user: { email: email.toLowerCase().trim(), id: 'mock-admin-uuid-123' },
              access_token: 'mock-jwt-token-xyz'
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(mockSession));
            authListeners.forEach(cb => cb('SIGNED_IN', mockSession));
            return { data: { session: mockSession }, error: null };
          } else {
            return { data: { session: null }, error: new Error('Invalid email or password.') };
          }
        },
        signOut: async () => {
          localStorage.removeItem(AUTH_KEY);
          // Trigger listeners in the current tab immediately
          authListeners.forEach(cb => cb('SIGNED_OUT', null));
          return { error: null };
        },
        onAuthStateChange: (callback) => {
          authListeners.push(callback);
          
          // Listen for storage changes from other tabs to sync
          window.addEventListener('storage', (e) => {
            if (e.key === AUTH_KEY) {
              const session = e.newValue ? JSON.parse(e.newValue) : null;
              callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
            }
          });
          // Call callback immediately with initial state
          const sessionJson = localStorage.getItem(AUTH_KEY);
          callback(sessionJson ? 'SIGNED_IN' : 'SIGNED_OUT', sessionJson ? JSON.parse(sessionJson) : null);
          
          return { data: { subscription: { unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) authListeners.splice(index, 1);
          } } } };
        }
      };
    }

    from(table) {
      let queryData = [];
      
      // Load table data
      if (table === 'blogs') {
        const existing = localStorage.getItem(BLOGS_KEY);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            // If the local storage is missing new fields (like title_image_url), reset it to load defaults
            if (parsed.length > 0 && !parsed[0].hasOwnProperty('title_image_url')) {
              localStorage.removeItem(BLOGS_KEY);
            }
          } catch(e) {}
        }
        if (!localStorage.getItem(BLOGS_KEY)) {
          // Pre-populate with website's original blogs, updated for new fields
          const defaults = [
            {
              id: 1,
              title: "Genetic counselor could be your healthcare superhero",
              slug: "genetic-counselor-superhero",
              category: "Clinical Genetics",
              published_date: "2026-06-15",
              read_time: "4 min read",
              excerpt: "In the landscape of modern medicine, genetic testing has emerged as a transformative tool, offering profound insights into our health and hereditary risks. Behind these scientific breakthroughs lies a compassionate and essential profession: genetic counseling.",
              title_image_url: "Images/blog_genetic_counselor.png",
              banner_image_url: "Images/blog_genetic_counselor.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Genetic Counselor: Your Healthcare Superhero | Progenics",
              tags: ["Counseling", "Patient Care", "Precision Medicine"],
              content: `<p>In the landscape of modern medicine, genetic testing has emerged as a transformative tool, offering profound insights into our health and hereditary risks. Behind these scientific breakthroughs lies a compassionate and essential profession: genetic counseling.</p>
<p>Ever wondered what secrets your DNA carries? Imagine if those secrets could open the door to a happier, healthier you. Genetic counselors help you with this. They enable you to make informed choices by revealing hints about your health hazards, therefore acting as your genes' Sherlock Holmes.</p>
<h2 class="serif-italic">Who exactly is a genetic counselor?</h2>
<p>Genetic counselors are healthcare professionals with specialized education and training in the areas of medical genetics and counseling. They play a dual role: providing clinical expertise in understanding complex genetic data and offering emotional support to individuals and families navigating genetic health concerns.</p>
<blockquote class="blog-blockquote">
<p>"Genetic counseling is the process of helping people understand and adapt to the medical, psychological and familial implications of genetic contributions to disease."</p>
</blockquote>
<p>A genetic counselor can help you understand your family history, assess the risk of inherited conditions, and guide you through the process of genetic testing. They explain what the tests can (and cannot) tell you, and help you interpret the results in the context of your life and family planning.</p>
<h2 class="serif-italic">Why do you need one?</h2>
<p>Genetic information can be complex and sometimes overwhelming. Whether you are planning a pregnancy, managing a chronic condition, or concerned about a family history of cancer, a genetic counselor provides the clarity and support you need to make the best decisions for your health.</p>
<p>At Progenics, we believe that genetic insights should be accompanied by expert guidance. Our counselors are here to ensure that your journey into your genetic blueprint is empowering and informed.</p>`
            },
            {
              id: 2,
              title: "Genetic Testing and Pregnancy: What Expectant Parents Should Know",
              slug: "genetic-testing-pregnancy",
              category: "Reproductive Health",
              published_date: "2026-06-08",
              read_time: "5 min read",
              excerpt: "Welcoming a new life into the world is an extraordinary journey filled with anticipation and preparation. Among the many considerations for expectant parents, genetic testing stands out as a powerful tool, providing insights into chromosomal conditions.",
              title_image_url: "Images/blog_pregnancy_testing.png",
              banner_image_url: "Images/blog_pregnancy_testing.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Genetic Testing & Pregnancy Guide | Progenics Labs",
              tags: ["Pregnancy", "NIPS", "Parenting", "Prenatal"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 3,
              title: "Microproteins in Cancer: Genomic Discoveries and Therapeutic Potential",
              slug: "microproteins-cancer",
              category: "Oncology",
              published_date: "2026-05-28",
              read_time: "6 min read",
              excerpt: "The article “Microproteins in cancer: identification, biological functions, and clinical implications” delves into the emerging field of microproteins and their role in cancer mechanism and potential oncogenic processes.",
              title_image_url: "Images/blog_microproteins_cancer.png",
              banner_image_url: "Images/blog_microproteins_cancer.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Microproteins in Cancer Therapeutics | Progenics Labs",
              tags: ["Cancer", "Research", "Microproteins", "Therapy"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 4,
              title: "Behind the Genes: Why BRCA Testing is a Must for Women’s Health",
              slug: "brca-testing-womens-health",
              category: "Oncology",
              published_date: "2026-05-15",
              read_time: "5 min read",
              excerpt: "In the realm of women’s health, knowledge is a powerful tool. Understanding your genetic makeup can provide invaluable insights into your risk for certain conditions, especially breast and ovarian cancers.",
              title_image_url: "Images/blog_brca_testing.png",
              banner_image_url: "Images/blog_brca_testing.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "BRCA Testing & Breast Cancer Risk Screening | Progenics Labs",
              tags: ["BRCA", "Breast Cancer", "Prevention", "Women's Health"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 5,
              title: "Gut feelings: The surprising link between your GUT and MENTAL Health",
              slug: "gut-feelings-mental-health",
              category: "Preventive Health",
              published_date: "2026-04-30",
              read_time: "4 min read",
              excerpt: "Have you ever felt “butterflies” in your stomach before a big presentation or a “knot” when you’re stressed? These sensations aren’t just in your head—they’re in your gut too, highlighting the gut-brain axis.",
              title_image_url: "Images/blog_gut_mental_health.png",
              banner_image_url: "Images/blog_gut_mental_health.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Gut Microbiome and Mental Health Connection | Progenics Labs",
              tags: ["Gut Health", "Microbiome", "Mental Health", "Gut-Brain Axis"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 6,
              title: "WES vs. CMA: Understanding the Difference",
              slug: "wes-vs-cma",
              category: "Clinical Genetics",
              published_date: "2026-04-12",
              read_time: "5 min read",
              excerpt: "In the ever-evolving landscape of genetics, diagnostic tools play a pivotal role. Two such prominent tools are Whole Exome Sequencing (WES) and Chromosomal Microarray (CMA), each serving unique diagnostic purposes.",
              title_image_url: "Images/blog_wes_vs_cma.png",
              banner_image_url: "Images/blog_wes_vs_cma.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "WES vs. CMA Diagnostics Guide | Progenics Labs",
              tags: ["Exome Sequencing", "Microarray", "Diagnostics", "WES", "CMA"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 7,
              title: "Does consanguineous marriage really cause genetic abnormalities in children",
              slug: "consanguineous-marriage",
              category: "Clinical Genetics",
              published_date: "2026-03-25",
              read_time: "6 min read",
              excerpt: "Consanguineous marriage, the union between closely related individuals, has been practiced for generations across various cultures. While providing social cohesion, it also raises significant genetic concerns for offspring.",
              title_image_url: "Images/blog_consanguineous_marriage.png",
              banner_image_url: "Images/blog_consanguineous_marriage.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Consanguineous Marriage Genetic Abnormalities Risks | Progenics Labs",
              tags: ["Hereditary", "Consanguinity", "Carrier Screening", "Family"],
              content: "<p>Details mapped to static page.</p>"
            },
            {
              id: 8,
              title: "Detecting Arthritis Early: Genetic Testing for Prevention and Care",
              slug: "arthritis-early-detection",
              category: "Preventive Health",
              published_date: "2026-03-10",
              read_time: "5 min read",
              excerpt: "Did you know that genetic factors account for up to 60% of rheumatoid arthritis risk? This means that your family history and genetic makeup play a significant role in early detection and care.",
              title_image_url: "Images/blog_arthritis_early_detection.png",
              banner_image_url: "Images/blog_arthritis_early_detection.png",
              publish_status: "Published",
              visibility: "Public",
              publication: "Progenics Labs",
              seo_meta_title: "Arthritis Early Detection Genetic Testing | Progenics Labs",
              tags: ["Arthritis", "Early Detection", "Joint Health", "Prevention"],
              content: "<p>Details mapped to static page.</p>"
            }
          ];
          localStorage.setItem(BLOGS_KEY, JSON.stringify(defaults));
        }
        queryData = JSON.parse(localStorage.getItem(BLOGS_KEY));
      } else if (table === 'careers') {
        if (!localStorage.getItem(CAREERS_KEY)) {
          // Pre-populate with website's original openings
          const defaults = [
            {
              id: 1,
              title: "Product Designer & Developer",
              location: "Hyderabad",
              type: "Full-time",
              level: "Mid-Level",
              is_active: true,
              description: "We are looking for a creative Product Designer and Developer to join our team in Hyderabad. You will build and scale our genomics portals."
            }
          ];
          localStorage.setItem(CAREERS_KEY, JSON.stringify(defaults));
        }
        queryData = JSON.parse(localStorage.getItem(CAREERS_KEY));
      } else if (table === 'gallery') {
        if (!localStorage.getItem(GALLERY_KEY)) {
          // Pre-populate with default gallery items
          const defaults = [
            {
              id: 1,
              title: "Gut Genics: Microbial Diversity and Human Well-being Study",
              category: "Publications",
              date: "June 2026",
              image_url: "Images/blog_genetic_counselor.png",
              description: "This scientific research paper analyzes the link between gut bacterial composition and chronic health states across diverse populations.",
              external_link: "https://pubmed.ncbi.nlm.nih.gov/",
              publish_status: "Published",
              visibility: "Public"
            },
            {
              id: 2,
              title: "Next-Generation Non-Invasive Prenatal Testing Outcomes",
              category: "Publications",
              date: "April 2026",
              image_url: "Images/blog_pregnancy_testing.png",
              description: "A comprehensive cohort review of prenatal testing accuracy and clinical efficacy using next-gen cell-free DNA sequencing models.",
              external_link: "https://pubmed.ncbi.nlm.nih.gov/",
              publish_status: "Published",
              visibility: "Public"
            },
            {
              id: 3,
              title: "Annual Genomic Wellness Conference 2026",
              category: "Events",
              date: "July 24, 2026",
              image_url: "Images/blog_microproteins_cancer.png",
              description: "Progenics Labs is hosting the annual Genomic Wellness Conference in Hyderabad, featuring panels with international genetic researchers.",
              external_link: "https://progenics.com/wellness-conf",
              publish_status: "Published",
              visibility: "Public"
            },
            {
              id: 4,
              title: "Clinical Genetics and Cancer Screening Seminar",
              category: "Events",
              date: "May 18, 2026",
              image_url: "Images/blog_brca_testing.png",
              description: "A specialized clinical seminar for oncologists and healthcare practitioners covering BRCA screening technologies and risk assessments.",
              external_link: "#",
              publish_status: "Published",
              visibility: "Public"
            },
            {
              id: 5,
              title: "Progenics Labs Announces Expansion of Preventive Health Panel",
              category: "News",
              date: "June 02, 2026",
              image_url: "Images/blog_gut_mental_health.png",
              description: "Progenics Labs has officially announced the expansion of its preventive gene screening panel, adding WellGenics and FitGenics testing kits.",
              external_link: "https://news.progenics.com",
              publish_status: "Published",
              visibility: "Public"
            },
            {
              id: 6,
              title: "CEO Interview: The Future of Personalized Medicine in India",
              category: "News",
              date: "March 20, 2026",
              image_url: "Images/blog_wes_vs_cma.png",
              description: "An exclusive profile and interview on national health media detailing the Progenics vision for democratizing genomics and personalized medicine.",
              external_link: "https://news.progenics.com",
              publish_status: "Published",
              visibility: "Public"
            }
          ];
          localStorage.setItem(GALLERY_KEY, JSON.stringify(defaults));
        }
        queryData = JSON.parse(localStorage.getItem(GALLERY_KEY));
      } else if (table === 'recycle_bin') {
        if (!localStorage.getItem(RECYCLE_BIN_KEY)) {
          localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify([]));
        }
        queryData = JSON.parse(localStorage.getItem(RECYCLE_BIN_KEY));
      }

      // Chainable API builder simulator
      const builder = {
        select: function() { return this; },
        eq: function(field, value) {
          queryData = queryData.filter(item => {
            if (item[field] === undefined || item[field] === null) return false;
            return String(item[field]) === String(value);
          });
          return this;
        },
        order: function(field, { ascending } = { ascending: true }) {
          queryData.sort((a, b) => {
            if (a[field] < b[field]) return ascending ? -1 : 1;
            if (a[field] > b[field]) return ascending ? 1 : -1;
            return 0;
          });
          return this;
        },
        single: async function() {
          return { data: queryData[0] || null, error: queryData.length === 0 ? new Error('Not found') : null };
        },
        // Support direct promise returning for await calls
        then: function(onfulfilled) {
          return Promise.resolve({ data: queryData, error: null }).then(onfulfilled);
        },
        // CRUD operations
        insert: async function(records) {
          try {
            const storageKey = table === 'recycle_bin' ? RECYCLE_BIN_KEY : `progenics_mock_${table}`;
            const all = JSON.parse(localStorage.getItem(storageKey)) || [];
            records.forEach(rec => {
              if (rec.id === undefined || rec.id === null) {
                rec.id = Date.now() + Math.floor(Math.random() * 1000);
              }
              if (!rec.created_at) {
                rec.created_at = new Date().toISOString();
              }
              all.push(rec);
            });
            localStorage.setItem(storageKey, JSON.stringify(all));
            return { data: records, error: null };
          } catch (err) {
            console.error('Mock insert failed:', err);
            return { data: null, error: err };
          }
        },
        update: function(updates) {
          return {
            eq: async function(field, value) {
              try {
                const storageKey = table === 'recycle_bin' ? RECYCLE_BIN_KEY : `progenics_mock_${table}`;
                const all = JSON.parse(localStorage.getItem(storageKey)) || [];
                const updated = all.map(item => {
                  if (item[field] === value || String(item[field]) === String(value)) {
                    return { ...item, ...updates };
                  }
                  return item;
                });
                localStorage.setItem(storageKey, JSON.stringify(updated));
                return { data: updates, error: null };
              } catch (err) {
                console.error('Mock update failed:', err);
                return { data: null, error: err };
              }
            }
          };
        },
        delete: function() {
          return {
            eq: async function(field, value) {
              try {
                const storageKey = table === 'recycle_bin' ? RECYCLE_BIN_KEY : `progenics_mock_${table}`;
                const all = JSON.parse(localStorage.getItem(storageKey)) || [];
                const filtered = all.filter(item => String(item[field]) !== String(value));
                localStorage.setItem(storageKey, JSON.stringify(filtered));
                return { data: null, error: null };
              } catch (err) {
                console.error('Mock delete failed:', err);
                return { data: null, error: err };
              }
            }
          };
        }
      };

      return builder;
    }
  }

  supabaseClient = new MockSupabaseClient();

} else {
  // Production mode — connect to the live Supabase database.
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}
