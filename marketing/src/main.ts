import './style.css';

interface SectorData {
  tag: string;
  title: string;
  description: string;
  list: string[];
  image: string;
}

type Lang = 'es' | 'en';

const pageTranslations: Record<Lang, Record<string, string>> = {
  es: {
    'nav.magic': 'La Magia',
    'nav.sectors': 'Sectores',
    'nav.contact': 'Contacto',
    'nav.login': 'Acceso Clientes',
    'hero.pill': 'Mantenimiento de Próxima Generación',
    'hero.title': 'Gestión de Instalaciones con <span class="gradient-text">Cero Fricción</span>',
    'hero.subtitle': 'Impulsado por Solvo. Reporta, asigna y realiza el seguimiento de incidencias de limpieza y mantenimiento al instante. Sin barreras de contraseña ni descargas de apps: ejecución fluida y robusta.',
    'hero.ctaPrimary': 'Explorar Sectores',
    'hero.ctaSecondary': 'Ver Cómo Funciona',
    'magic.title': 'El Motor de Solvo',
    'magic.subtitle': 'Una arquitectura sin estado y sin contraseñas diseñada para el rendimiento en el campo y la velocidad operativa.',
    'magic.feat1Title': 'Portal Móvil Sin Contraseñas',
    'magic.feat1Text': 'Los operarios acceden a su panel dinámico de tareas con un solo toque desde un enlace URL seguro. Cero restablecimientos de contraseñas, cero retrasos en el acceso.',
    'magic.feat2Title': 'Automatización por WhatsApp',
    'magic.feat2Text': 'Las asignaciones de tareas, cambios de estado y actualizaciones críticas se envían al instante a los números móviles de los operarios mediante notificaciones automáticas.',
    'magic.feat3Title': 'Reportes por Código QR',
    'magic.feat3Text': 'Coloca pegatinas con códigos QR únicos en maquinaria, puertas o baños. Cualquier persona puede escanear y enviar incidencias al instante sin barreras de registro.',
    'magic.feat4Title': 'Esquemas Dinámicos por Sector',
    'magic.feat4Text': 'Arquitectura multi-tenant con base de datos única y aislamiento a nivel de ORM. Los campos personalizados y los diseños se adaptan dinámicamente a tu imagen de marca.',
    'showcase.title': 'Una Herramienta, Adaptabilidad Infinita',
    'showcase.subtitle': 'Mira cómo Solvo configura dinámicamente sus esquemas, colores y plantillas de diseño según el dominio específico de la instalación.',
    'showcase.tabZoo': '🦁 Parques Temáticos y Zoos',
    'showcase.tabMall': '🛍️ Centros Comerciales',
    'showcase.tabSchool': '🏫 Instituciones Educativas',
    'showcase.tabResidential': '🏢 Complejos Residenciales',
    'contact.title': '¿Listo para optimizar tus instalaciones?',
    'contact.subtitle': 'Ponte en contacto con nuestros expertos de producto hoy mismo para configurar una demostración personalizada para tu negocio.',
    'footer.copy': '&copy; 2026 Solvo. Todos los derechos reservados. Mantenimiento con Cero Fricción.'
  },
  en: {
    'nav.magic': 'The Magic',
    'nav.sectors': 'Sectors',
    'nav.contact': 'Contact',
    'nav.login': 'Client Login',
    'hero.pill': 'Next-Gen Maintenance System',
    'hero.title': 'Facility Management with <span class="gradient-text">Zero Friction</span>',
    'hero.subtitle': 'Powered by Solvo. Instantly report, assign, and track cleaning and maintenance issues. No password barrier, no app downloads—just seamless, robust execution.',
    'hero.ctaPrimary': 'Explore Industries',
    'hero.ctaSecondary': 'See How It Works',
    'magic.title': 'The Solvo Engine',
    'magic.subtitle': 'A stateless, passwordless architecture built for field performance and operational speed.',
    'magic.feat1Title': 'Passwordless Mobile Hub',
    'magic.feat1Text': 'Operators access their dynamic task board with a single tap from a secure URL link. Zero password resets, zero login delays.',
    'magic.feat2Title': 'WhatsApp Automation',
    'magic.feat2Text': 'Task assignments, status changes, and critical updates are dispatched instantly to operators\' mobile numbers via automated notifications.',
    'magic.feat3Title': 'QR Code Ticketing',
    'magic.feat3Text': 'Deploy unique QR code stickers on machinery, doors, or bathrooms. Anyone can scan and submit issues instantly without register barriers.',
    'magic.feat4Title': 'Dynamic Sector Schemas',
    'magic.feat4Text': 'Single-DB multi-tenant architecture isolated at the ORM level. Custom fields and layouts adapt dynamically to your visual branding.',
    'showcase.title': 'One Tool, Endless Adaptability',
    'showcase.subtitle': 'See how Solvo dynamically configures its schema, colors, and layout templates depending on the specific facility domain.',
    'showcase.tabZoo': '🦁 Theme Parks & Zoos',
    'showcase.tabMall': '🛍️ Shopping Malls',
    'showcase.tabSchool': '🏫 Educational Institutions',
    'showcase.tabResidential': '🏢 Residential Complexes',
    'contact.title': 'Ready to optimize your facility?',
    'contact.subtitle': 'Get in touch with our product experts today to setup a custom demo for your business.',
    'footer.copy': '&copy; 2026 Solvo. All rights reserved. Zero-Friction Upkeep.'
  }
};

const sectorDatabase: Record<Lang, Record<string, SectorData>> = {
  es: {
    zoo: {
      tag: 'Zoo y Parques',
      title: 'Solvo Wild Zoo',
      description: 'Optimiza la seguridad del parque y el bienestar de los animales. Supervisa activos como filtros de piscinas, vallas perimetrales y puntos de cobro con campos específicos localizados.',
      list: [
        '<strong>Zonas Activas del Parque:</strong> Controla eventos en Restaurantes, Acuarios y Recintos.',
        '<strong>Activos Personalizados:</strong> Registro seguro para bombas, cajas TPV y vallados.',
        '<strong>Control de Seguridad:</strong> Resalta e identifica riesgos críticos para el público.'
      ],
      image: '/assets/showcase-zoo.png'
    },
    mall: {
      tag: 'Retail y Comercial',
      title: 'Plaza Premium Shopping Mall',
      description: 'Establece un mantenimiento con cero fricciones para grandes complejos comerciales. Gestiona fácilmente áreas comunes, aseos, ascensores e incidencias reportadas por locales.',
      list: [
        '<strong>Plantas y Zonas:</strong> Rastrea coordenadas exactas (ej. Planta Baja, Aparcamiento).',
        '<strong>Locales Comerciales:</strong> Vincula reportes a tiendas como Zara, H&M o zonas de comida.',
        '<strong>Transporte Vertical:</strong> Registra escaleras y ascensores críticos para auditorías de seguridad.'
      ],
      image: '/assets/showcase-mall.png'
    },
    school: {
      tag: 'Educativo y Campus',
      title: 'Bright Future Academy',
      description: 'Mantén un entorno educativo seguro y operativo. Reporta problemas de proyectores, calefacción rota o averías de fontanería al instante desde cualquier aula.',
      list: [
        '<strong>Pabellones del Campus:</strong> Organiza por Pabellón A, Gimnasio, Comedor o Biblioteca.',
        '<strong>Aulas e Instalaciones:</strong> Vincula incidencias a salas específicas (ej. Aula 101, Laboratorio).',
        '<strong>Priorización Inteligente:</strong> Clasifica de forma prioritaria las averías que interrumpen las clases.'
      ],
      image: '/assets/showcase-school.png'
    },
    residential: {
      tag: 'Propiedad y Residencial',
      title: 'Park Heights Residence',
      description: 'Coordina administradores de fincas, operarios y vecinos en complejos residenciales. Mantén puertas automáticas, cerraduras, ascensores y jardines en perfecto estado.',
      list: [
        '<strong>Bloques y Portales:</strong> Clasifica problemas según el bloque, torre o escalera.',
        '<strong>Elementos Comunes:</strong> Verifica de forma inmediata el ascensor, puerta de garaje o portero.',
        '<strong>Reportes Sin Registro:</strong> Los vecinos reportan mediante código QR, los operarios resuelven sin contraseñas.'
      ],
      image: '/assets/showcase-residential.png'
    }
  },
  en: {
    zoo: {
      tag: 'Zoo & Park Ops',
      title: 'Solvo Wild Zoo',
      description: 'Optimize park safety and animal wellbeing. Track assets like pool filters, perimeter fences, and cashier points with specific localized fields.',
      list: [
        '<strong>Active Park Zones:</strong> Track events in Restaurants, Marines, and Fences.',
        '<strong>Custom Asset Types:</strong> Safe tracking for pumps, POS checkouts, and fencing.',
        '<strong>Safety Checks:</strong> Highlights and flags critical public risks.'
      ],
      image: '/assets/showcase-zoo.png'
    },
    mall: {
      tag: 'Retail & Commercial',
      title: 'Plaza Premium Shopping Mall',
      description: 'Establish zero-friction upkeep for large shopping complexes. Easily manage common areas, restrooms, elevators, and tenant-reported issues.',
      list: [
        '<strong>Floors & Zones:</strong> Track exact coordinates (e.g. Ground Floor, Basement Parking).',
        '<strong>Commercial Outlets:</strong> Bind reports to stores like Zara, H&M, or food courts.',
        '<strong>Vertical Transport:</strong> Flag critical escalators and elevators for safety audits.'
      ],
      image: '/assets/showcase-mall.png'
    },
    school: {
      tag: 'Education & Campus',
      title: 'Bright Future Academy',
      description: 'Maintain a safe, operational learning environment. Report projector issues, broken heating, or plumbing failures instantly from any classroom.',
      list: [
        '<strong>Campus Buildings:</strong> Organize by Pavilion A, Gym, Canteen, or Library.',
        '<strong>Classrooms:</strong> Bind issues to specific rooms (e.g., Room 101, Gym, Lab).',
        '<strong>Smart Prioritization:</strong> Automatically prioritize class-disrupting failures.'
      ],
      image: '/assets/showcase-school.png'
    },
    residential: {
      tag: 'Property & Residential',
      title: 'Park Heights Residence',
      description: 'Coordinate facility managers, operators, and tenants in complex residential estates. Keep doors, locks, elevators, and gardens working.',
      list: [
        '<strong>Portals & Towers:</strong> Track issues by blocks, towers, and portals.',
        '<strong>Element Classification:</strong> Instantly check elevators, gates, and intercoms.',
        '<strong>Stateless Reporting:</strong> Tenants report issues via QR scan, operators resolve passwordless.'
      ],
      image: '/assets/showcase-residential.png'
    }
  }
};

let currentLang: Lang = (localStorage.getItem('solvo_lang') as Lang) || 'es';
let activeSector = 'zoo';

function translatePage(lang: Lang) {
  const dictionary = pageTranslations[lang];
  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
  
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && dictionary[key]) {
      el.innerHTML = dictionary[key];
    }
  });

  // Set html document lang
  document.documentElement.lang = lang;

  // Refresh active showcase tab layout text content in current language
  updateShowcase(lang, activeSector);
}

function updateShowcase(lang: Lang, sector: string) {
  const data = sectorDatabase[lang][sector];
  if (!data) return;

  const showcaseTag = document.getElementById('showcase-tag');
  const showcaseTitle = document.getElementById('showcase-title');
  const showcaseDescription = document.getElementById('showcase-description');
  const showcaseList = document.getElementById('showcase-list');
  const showcaseImg = document.getElementById('showcase-img') as HTMLImageElement | null;

  if (showcaseImg) {
    showcaseImg.src = data.image;
  }
  
  if (showcaseTag) showcaseTag.textContent = data.tag;
  if (showcaseTitle) showcaseTitle.textContent = data.title;
  if (showcaseDescription) showcaseDescription.textContent = data.description;
  
  if (showcaseList) {
    showcaseList.innerHTML = '';
    data.list.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = item;
      showcaseList.appendChild(li);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab-button');
  const langButtons = document.querySelectorAll<HTMLButtonElement>('.lang-btn');
  
  // Set target APP URL dynamically
  const clientLoginBtn = document.getElementById('client-login-btn') as HTMLAnchorElement | null;
  if (clientLoginBtn) {
    const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
    clientLoginBtn.href = appUrl;
  }

  // Load and apply initial language translations
  translatePage(currentLang);
  
  // Activate selected language toggle class
  langButtons.forEach(btn => {
    const lang = btn.getAttribute('data-lang') as Lang;
    if (lang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Handle Showcase Tab Clicks
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sector = btn.getAttribute('data-sector');
      if (!sector) return;
      
      activeSector = sector;
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const showcaseImg = document.getElementById('showcase-img') as HTMLImageElement | null;
      if (showcaseImg) {
        showcaseImg.style.opacity = '0';
        setTimeout(() => {
          updateShowcase(currentLang, activeSector);
          showcaseImg.style.opacity = '1';
        }, 150);
      } else {
        updateShowcase(currentLang, activeSector);
      }
    });
  });

  // Handle Language Selectors
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang') as Lang;
      if (!lang || lang === currentLang) return;
      
      currentLang = lang;
      localStorage.setItem('solvo_lang', lang);
      
      // Update toggle class styles
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Run translation engine
      translatePage(currentLang);
    });
  });
});
