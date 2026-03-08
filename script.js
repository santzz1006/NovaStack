"use strict";

/**
 * ============================================================================
 * NOVASTACK | CORE SYSTEM ARCHITECTURE 2.0 (Custom Edition)
 * Adaptado perfeitamente para o HTML (Sem imagens, focado em CSS e JSON)
 * ============================================================================
 */

// ============================================================================
// 1. STATE & DATABASE (Estado e Dados da Aplicação)
// ============================================================================
const NovaDB = {
    state: {
        cursos: [], // Será preenchido pelo cursos.json
        cursosCarregados: false,
        categoriaAtual: null,
        readNotifications: JSON.parse(localStorage.getItem("ns_read_notifs") || "[]")
    },

    // Mapeamento de categorias (ID no HTML -> Nome Bonito)
    categoryNames: {
        "logica": "Lógica & Fundamentos",
        "frontend": "Front-End Developer",
        "backend": "Back-End Developer",
        "fullstack": "Full-Stack Developer",
        "mobile": "Mobile Developer",
        "database": "Banco de Dados & SQL",
        "datascience": "Data Science & Inteligência Artificial",
        "devops": "DevOps & Cloud",
        "design": "Design & Criatividade",
        "uxui": "UX/UI & Experiência Digital",
        "business": "Business & Soft Skills",
        "busca_global": "Resultados da Busca"
    },

    notifications: [
        { id: "notif-1", title: "Novo Módulo: React Native Avançado", text: "As aulas de animação com Reanimated 3 acabaram de chegar na base.", date: "Hoje", type: "new" },
        { id: "notif-2", title: "Atualização de UI Kit", text: "O Dark Mode UI Kit do Arsenal foi atualizado com 10 novas telas.", date: "Ontem", type: "store" },
        { id: "notif-3", title: "Transmissão Agendada", text: "Amanhã teremos uma call no Discord sobre Precificação de Projetos.", date: "Há 2 dias", type: "tip" }
    ],

    storeProducts: {
        'pack-bot': { name: "Pack Bot Restaurante JSON", price: "R$ 19,90", desc: "Templates de diálogo otimizados e prontos para injeção em APIs de WhatsApp. Fluxos de atendimento, cardápio e encerramento testados em produção.", checkoutUrl: "#" },
        'pack-ui': { name: "Dark Mode UI Kit Figma", price: "R$ 29,90", desc: "Mais de 50 telas minimalistas e modulares prontas para exportar e codar em React ou React Native. Focado em Dashboards e SaaS.", checkoutUrl: "#" },
        'pack-freela': { name: "Contratos de Desenvolvimento", price: "Grátis (Membros)", desc: "Documentos legais revisados em PDF e Word para proteger seus projetos fechados no 99Freelas e com clientes diretos.", checkoutUrl: "#" }
    }
};

// ============================================================================
// 2. UTILS (Ferramentas de Suporte)
// ============================================================================
const Utils = {
    // Evita travamentos quando o usuário digita rápido na busca
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    },
    
    // Protege o site contra injeção de código
    escapeHTML: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ============================================================================
// 3. CONTROLLERS (Módulos Funcionais)
// ============================================================================

/**
 * Controller: Painel de Notificações
 */
const NotificationController = {
    init() {
        this.btn = document.getElementById("btnNotifications");
        this.panel = document.getElementById("ns-notification-panel");
        this.list = document.getElementById("ns-notification-list");
        this.badge = this.btn ? this.btn.querySelector(".ns-badge") : null;
        this.markAllBtn = document.getElementById("markAllRead");
        
        if (!this.btn || !this.panel) return;
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        this.btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.panel.classList.toggle('active');
        });

        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.btn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        if (this.markAllBtn) {
            this.markAllBtn.addEventListener('click', () => {
                const allIds = NovaDB.notifications.map(n => n.id);
                this.markAsRead(allIds);
            });
        }
    },

    markAsRead(idsArray) {
        let currentRead = new Set(NovaDB.state.readNotifications);
        idsArray.forEach(id => currentRead.add(id));
        
        NovaDB.state.readNotifications = Array.from(currentRead);
        localStorage.setItem('ns_read_notifs', JSON.stringify(NovaDB.state.readNotifications));
        this.render();
    },

    render() {
        const unreadCount = NovaDB.notifications.filter(n => !NovaDB.state.readNotifications.includes(n.id)).length;
        
        if (this.badge) {
            this.badge.textContent = unreadCount > 0 ? unreadCount : "";
            this.badge.style.display = unreadCount > 0 ? "flex" : "none";
        }

        if (this.list) {
            if (NovaDB.notifications.length === 0) {
                this.list.innerHTML = `<p style="padding:20px; text-align:center; color:#a0a0a5;">Sistemas operando. Sem transmissões.</p>`;
                return;
            }

            this.list.innerHTML = NovaDB.notifications.map(n => {
                const isRead = NovaDB.state.readNotifications.includes(n.id);
                const dot = isRead ? '' : `<span style="display:inline-block;width:8px;height:8px;background:#fff;border-radius:50%;margin-right:8px;"></span>`;
                const bg = isRead ? 'transparent' : 'rgba(255,255,255,0.05)';
                const color = isRead ? '#a0a0a5' : '#ffffff';

                return `
                    <div style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; background:${bg};" data-id="${n.id}" class="notif-item">
                        <h4 style="font-size:0.95rem; margin-bottom:5px; color:${color};">${dot}${Utils.escapeHTML(n.title)}</h4>
                        <p style="font-size:0.85rem; color:#a0a0a5;">${Utils.escapeHTML(n.text)}</p>
                        <small style="font-size:0.75rem; color:#a0a0a5; display:block; margin-top:8px;">${n.date}</small>
                    </div>
                `;
            }).join('');

            // Clique no item da notificação
            this.list.querySelectorAll('.notif-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.markAsRead([item.dataset.id]);
                });
            });
        }
    }
};

/**
 * Controller: Navegação por Abas Principais
 */
const TabController = {
    init() {
        this.tabBtns = document.querySelectorAll('.ns-tab-btn');
        this.tabContents = document.querySelectorAll('.ns-tab-content');

        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target));
        });
    },

    switchTab(clickedBtn) {
        const targetId = clickedBtn.getAttribute('data-target');
        if (!targetId) return;

        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabContents.forEach(c => c.classList.remove('active'));

        clickedBtn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
    }
};

/**
 * Controller: Motor de Busca Global (Aquele no Header)
 */
const SearchEngine = {
    init() {
        this.input = document.getElementById('quickSearch');
        if (!this.input) return;

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSearch(this.input.value);
            }
        });
    },

    executeSearch(query) {
        if (!NovaDB.state.cursosCarregados) return;
        
        query = query.toLowerCase().trim();
        if (query.length === 0) return;

        let resultados = NovaDB.state.cursos.filter(c => c.nome.toLowerCase().includes(query));

        // Usa o ModalController para mostrar os resultados
        ModalController.openCourseModal('busca_global', resultados);
        this.input.value = '';
        this.input.blur();
    }
};

/**
 * Controller: Carrossel Horizontal Responsivo
 */
const CarouselController = {
    init() {
        const wrappers = document.querySelectorAll('.ns-carousel-wrapper');
        
        wrappers.forEach(wrapper => {
            const track = wrapper.querySelector('.ns-carousel-track');
            const btnLeft = wrapper.querySelector('.ns-carousel-arrow.left');
            const btnRight = wrapper.querySelector('.ns-carousel-arrow.right');

            if (!track) return;

            const scrollConfig = {
                getAmount: () => {
                    const card = track.querySelector('.ns-card');
                    return card ? (card.offsetWidth + 24) * 2 : 300; 
                }
            };

            if (btnLeft) btnLeft.addEventListener('click', () => track.scrollBy({ left: -scrollConfig.getAmount(), behavior: 'smooth' }));
            if (btnRight) btnRight.addEventListener('click', () => track.scrollBy({ left: scrollConfig.getAmount(), behavior: 'smooth' }));
        });
    }
};

/**
 * Controller: Gestão de Modais (Cursos, JSON e Loja)
 */
const ModalController = {
    init() {
        this.overlay = document.getElementById('ns-modal-overlay');
        
        // Modal Cursos
        this.courseModal = document.getElementById('ns-course-modal');
        this.courseTitle = document.getElementById('modal-category-title');
        this.courseCount = document.getElementById('modal-category-count');
        this.courseList = document.getElementById('modal-course-list');
        this.searchInput = document.getElementById('modalSearchInput');
        
        // Modal Loja
        this.storeModal = document.getElementById('ns-product-modal');
        this.storeTitle = document.getElementById('productModalTitle');
        this.storePrice = document.getElementById('productModalPrice');
        this.storeDesc = document.getElementById('productModalDesc');

        this.bindEvents();
    },

    bindEvents() {
        // Fechar modais
        if (this.overlay) this.overlay.addEventListener('click', () => this.closeAllModals());
        document.querySelectorAll('.ns-modal__close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });

        // Triggers de Cursos (Os blocos grandes)
        document.querySelectorAll('.ns-card[data-category]').forEach(card => {
            card.addEventListener('click', () => {
                if (!NovaDB.state.cursosCarregados) {
                    alert("Aguarde, os protocolos ainda estão sendo carregados na base...");
                    return;
                }
                const category = card.getAttribute('data-category');
                if(category) this.openCourseModal(category);
            });
        });

        // ==========================================
        // TRIGGERS DA LOJA (Modificado para Modo Manutenção)
        // ==========================================
        document.querySelectorAll('.ns-store-card .ns-btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openStoreMaintenanceModal();
            });
        });

        // ==========================================
        // NOVOS TRIGGERS DA COMUNIDADE (DISCORD E LIVE)
        // ==========================================
        const btnDiscord = document.getElementById('card-discord');
        if (btnDiscord) {
            btnDiscord.addEventListener('click', () => this.openDiscordModal());
        }

        const btnLive = document.getElementById('card-live');
        if (btnLive) {
            btnLive.addEventListener('click', () => this.openLiveModal());
        }

        // Busca Interna do Modal de Cursos
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce((e) => {
                this.renderCourseList(e.target.value);
            }, 250));
        }
    },

    openCourseModal(categoryKey, searchResults = null) {
        if (!this.courseModal || !this.overlay) return;

        NovaDB.state.categoriaAtual = categoryKey;
        
        // Se vier do buscador global do Header
        if (searchResults) {
            // Simulamos uma categoria temporária só com os resultados
            NovaDB.state.cursosPesquisaGlobal = searchResults; 
        }

        if (this.courseTitle) {
            this.courseTitle.textContent = NovaDB.categoryNames[categoryKey] || categoryKey;
        }
        
        if (this.searchInput) this.searchInput.value = '';
        this.renderCourseList('');

        this.overlay.classList.add('show');
        this.courseModal.classList.add('show');
        document.body.style.overflow = 'hidden'; 
    },

    openStoreModal(productId) {
        const product = NovaDB.storeProducts[productId];
        if (!product || !this.storeModal || !this.overlay) return;

        if(this.storeTitle) this.storeTitle.textContent = product.name;
        if(this.storePrice) this.storePrice.textContent = product.price;
        if(this.storeDesc) this.storeDesc.textContent = product.desc;

        this.overlay.classList.add('show');
        this.storeModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    // ==========================================
    // NOVAS FUNÇÕES PARA ABRIR OS MODAIS
    // ==========================================
    openStoreMaintenanceModal() {
        const modal = document.getElementById('ns-store-maintenance-modal');
        if (!modal || !this.overlay) return;
        this.overlay.classList.add('show');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    openDiscordModal() {
        const modal = document.getElementById('ns-discord-modal');
        if (!modal || !this.overlay) return;
        this.overlay.classList.add('show');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    openLiveModal() {
        const modal = document.getElementById('ns-live-modal');
        if (!modal || !this.overlay) return;
        this.overlay.classList.add('show');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    closeAllModals() {
        if (this.overlay) this.overlay.classList.remove('show');
        if (this.courseModal) this.courseModal.classList.remove('show');
        if (this.storeModal) this.storeModal.classList.remove('show');
        
        // ==========================================
        // FECHA OS NOVOS MODAIS DE MANUTENÇÃO
        // ==========================================
        document.getElementById('ns-discord-modal')?.classList.remove('show');
        document.getElementById('ns-live-modal')?.classList.remove('show');
        document.getElementById('ns-store-maintenance-modal')?.classList.remove('show');
        
        document.body.style.overflow = '';
        NovaDB.state.categoriaAtual = null;
        NovaDB.state.cursosPesquisaGlobal = null;
    },

    renderCourseList(query = '') {
        if (!this.courseList || !this.courseCount) return;

        const categoryKey = NovaDB.state.categoriaAtual;
        
        // Se for busca global, usa os resultados salvos, senão filtra do JSON
        let baseCursos = [];
        if (categoryKey === 'busca_global') {
            baseCursos = NovaDB.state.cursosPesquisaGlobal || [];
        } else {
            // Verifica o nome exato da categoria para bater com o JSON
            const categoriaNomeReal = NovaDB.categoryNames[categoryKey] || categoryKey;
            baseCursos = NovaDB.state.cursos.filter(c => c.categoria === categoriaNomeReal);
        }
        
        // Filtro da barra de pesquisa de dentro do Modal
        let filtered = baseCursos;
        if (query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            filtered = baseCursos.filter(c => c.nome.toLowerCase().includes(lowerQuery));
        }

        this.courseCount.textContent = `${filtered.length} arquivos de treinamento encontrados.`;

        if (filtered.length === 0) {
            this.courseList.innerHTML = `
                <div style="text-align:center; padding: 40px 0;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a0a0a5" stroke-width="1.5" style="margin-bottom:15px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <p style="color:#a0a0a5; font-size:1.1rem;">Nenhum arquivo correspondente a "${Utils.escapeHTML(query)}".</p>
                </div>
            `;
            return;
        }

        // Desenha a lista de cursos no HTML
        this.courseList.innerHTML = filtered.map(curso => {
            // A MÁGICA DO N8N CONTINUA AQUI INTACTA
            const isN8n = curso.nome.toLowerCase().includes('n8n');
            const linkHref = isN8n ? 'player.html' : curso.link;
            const linkTarget = isN8n ? '_self' : '_blank';
            const linkRel = isN8n ? '' : 'rel="noopener noreferrer"';
            
            // Exibe de onde o curso veio se estiver na busca global
            const tagCategoria = categoryKey === 'busca_global' ? `<span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">${curso.categoria}</span>` : '';

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="flex-grow: 1; padding-right: 20px;">
                        <h4 style="font-size: 1.05rem; color: #fff; margin-bottom: 8px;">${Utils.escapeHTML(curso.nome)}</h4>
                        ${tagCategoria}
                    </div>
                    <a href="${linkHref}" target="${linkTarget}" ${linkRel} style="background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; transition: 0.3s; white-space: nowrap;">Acessar</a>
                </div>
            `;
        }).join('');
    }
};

/**
 * Módulo de Carga de Dados
 */
const DatabaseManager = {
    async fetchJSON() {
        try {
            const resp = await fetch("cursos.json");
            NovaDB.state.cursos = await resp.json();
            NovaDB.state.cursosCarregados = true;
            console.log("✅ Base de Conhecimento Carregada:", NovaDB.state.cursos.length, "protocolos");
        } catch (error) {
            console.error("❌ Falha crítica ao conectar com cursos.json:", error);
            NovaDB.state.cursos = [];
            // Mesmo com erro, liberamos para não travar a interface
            NovaDB.state.cursosCarregados = true; 
        }
    }
}

// ============================================================================
// 4. BOOTSTRAPPER (Inicialização Segura da Aplicação)
// ============================================================================
const NovaStackApp = {
    async init() {
        console.log("🚀 NovaStack Core System Booting...");
        
        try {
            TabController.init();
            CarouselController.init();
            NotificationController.init();
            ModalController.init();
            SearchEngine.init();
            
            // Carrega as 7200 linhas de curso de forma assíncrona para não travar a tela
            await DatabaseManager.fetchJSON();
            
            console.log("✅ All systems online. No visual assets needed (CSS Only mode active).");
        } catch (error) {
            console.error("❌ System Boot Error:", error);
        }
    }
};

// Dispara apenas quando o DOM e CSS estiverem totalmente prontos
if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', () => NovaStackApp.init());
} else {
    NovaStackApp.init();
}