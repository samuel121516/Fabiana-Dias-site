/**
 * Fabiana Dias - Fisioterapeuta
 * Script principal do site
 */

// Variáveis globais
let isLoggedIn = false;
let isEditMode = false;
let currentEditElement = null;
let appointments = [];

// Elementos DOM
const loginBtn = document.getElementById('login-btn');
const scheduleBtn = document.getElementById('schedule-btn');
const loginModal = document.getElementById('login-modal');
const scheduleModal = document.getElementById('schedule-modal');
const appointmentsModal = document.getElementById('appointments-modal');
const loginForm = document.getElementById('login-form');
const scheduleForm = document.getElementById('schedule-form');
const closeLoginModal = document.querySelector('#login-modal .close-modal');
const closeScheduleModal = document.getElementById('close-schedule-modal');
const closeAppointmentsModal = document.getElementById('close-appointments-modal');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const appointmentsList = document.getElementById('appointments-list');

// Credenciais (em produção, isso seria verificado no servidor)
const ADMIN_USERNAME = 'fabianadias_fisio';
const ADMIN_PASSWORD = '123fabi456';

// Status de agendamento
const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};

// Configurações de upload de imagem
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Elementos para upload direto de imagem e edição de texto
let imagePreviewModal = null;
let textEditModal = null;
let currentUploadElement = null;
let currentTextElement = null;

// Elementos editáveis
const editableElements = [
  // Textos
  { id: 'welcome-title', selector: '.welcome-content .section-title', type: 'text' },
  { id: 'welcome-description', selector: '.welcome-content .section-description', type: 'text' },
  { id: 'services-title', selector: '#servicos .section-title', type: 'text' },
  { id: 'services-description', selector: '#servicos .section-description', type: 'text' },
  { id: 'gallery-title', selector: '#galeria .section-title', type: 'text' },
  { id: 'gallery-description', selector: '#galeria .section-description', type: 'text' },
  { id: 'contact-title', selector: '#contato .section-title', type: 'text' },
  { id: 'contact-description', selector: '#contato .section-description', type: 'text' },
  { id: 'address-text', selector: '#address-text', type: 'text' },
  { id: 'hours-text', selector: '#hours-text', type: 'text' },
  
  // Serviços
  { id: 'service-1-title', selector: '[data-id="service-1"] h3', type: 'text' },
  { id: 'service-1-description', selector: '[data-id="service-1"] p', type: 'text' },
  { id: 'service-2-title', selector: '[data-id="service-2"] h3', type: 'text' },
  { id: 'service-2-description', selector: '[data-id="service-2"] p', type: 'text' },
  { id: 'service-3-title', selector: '[data-id="service-3"] h3', type: 'text' },
  { id: 'service-3-description', selector: '[data-id="service-3"] p', type: 'text' },
  { id: 'service-4-title', selector: '[data-id="service-4"] h3', type: 'text' },
  { id: 'service-4-description', selector: '[data-id="service-4"] p', type: 'text' },
  
  // Links
  { id: 'whatsapp-link', selector: '#whatsapp-link', type: 'link', urlAttribute: 'href' },
  { id: 'instagram-link', selector: '#instagram-link', type: 'link', urlAttribute: 'href' },
  
  // Imagens
  { id: 'welcome-image', selector: '.welcome-image img', type: 'image', urlAttribute: 'src' },
  { id: 'service-1-image', selector: '[data-id="service-1"] img', type: 'image', urlAttribute: 'src' },
  { id: 'service-2-image', selector: '[data-id="service-2"] img', type: 'image', urlAttribute: 'src' },
  { id: 'service-3-image', selector: '[data-id="service-3"] img', type: 'image', urlAttribute: 'src' },
  { id: 'service-4-image', selector: '[data-id="service-4"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-1-image', selector: '[data-id="gallery-1"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-2-image', selector: '[data-id="gallery-2"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-3-image', selector: '[data-id="gallery-3"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-4-image', selector: '[data-id="gallery-4"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-5-image', selector: '[data-id="gallery-5"] img', type: 'image', urlAttribute: 'src' },
  { id: 'gallery-6-image', selector: '[data-id="gallery-6"] img', type: 'image', urlAttribute: 'src' },
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar o site
  init();
  
  // Event listeners para navegação e login
  loginBtn.addEventListener('click', openLoginModal);
  scheduleBtn.addEventListener('click', openScheduleModal);
  closeLoginModal.addEventListener('click', () => closeModal(loginModal));
  closeScheduleModal.addEventListener('click', () => closeModal(scheduleModal));
  closeAppointmentsModal.addEventListener('click', () => closeModal(appointmentsModal));
  loginForm.addEventListener('submit', handleLogin);
  scheduleForm.addEventListener('submit', handleScheduleSubmit);
  menuToggle.addEventListener('click', toggleMenu);
  
  // Filtro de agendamentos
  document.getElementById('filter-date').addEventListener('change', filterAppointments);
  document.getElementById('clear-filter-btn').addEventListener('click', clearAppointmentFilter);
  
  // Fechar modais ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      closeModal(loginModal);
    } else if (e.target === scheduleModal) {
      closeModal(scheduleModal);
    } else if (e.target === appointmentsModal) {
      closeModal(appointmentsModal);
    }
  });
  
  // Smooth scroll para links de navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href').startsWith('#') && link.getAttribute('href') !== '#') {
      link.addEventListener('click', smoothScroll);
    }
  });
});

// Inicialização
function init() {
  // Verificar se o usuário está logado (usando localStorage)
  checkLoginStatus();
  
  // Carregar conteúdo salvo (se existir)
  loadSavedContent();
  
  // Carregar agendamentos salvos
  loadAppointments();
  
  // Adicionar painel de edição ao DOM
  createEditPanel();
  
  // Criar modais
  createImagePreviewModal();
  createTextEditModal();
  
  // Adicionar overlays
  addImageUploadOverlays();
  addTextEditOverlays();
  
  // Definir data mínima nos campos de data como hoje
  const today = new Date().toISOString().split('T')[0];
  if (document.getElementById('schedule-date')) {
    document.getElementById('schedule-date').min = today;
  }
  if (document.getElementById('filter-date')) {
    document.getElementById('filter-date').min = today;
  }
}

// Verificar status de login
function checkLoginStatus() {
  // Remover persistência de login - sempre requer login
  isLoggedIn = false;
  localStorage.removeItem('isLoggedIn');
  
  loginBtn.textContent = 'Área do Profissional';
}

// Carregar conteúdo salvo
function loadSavedContent() {
  editableElements.forEach(element => {
    const savedContent = localStorage.getItem(element.id);
    if (savedContent) {
      const domElement = document.querySelector(element.selector);
      
      if (domElement) {
        if (element.type === 'text') {
          domElement.textContent = savedContent;
        } else if (element.type === 'link') {
          domElement.setAttribute(element.urlAttribute, savedContent);
        } else if (element.type === 'image') {
          domElement.setAttribute(element.urlAttribute, savedContent);
        }
      }
    }
  });
}

// Carregar agendamentos
function loadAppointments() {
  const savedAppointments = localStorage.getItem('appointments');
  if (savedAppointments) {
    appointments = JSON.parse(savedAppointments);
  }
}

// Criar botão de modo de edição
function createEditModeButton() {
  // Remover botões existentes se houver
  const existingButtons = document.querySelectorAll('.admin-button');
  existingButtons.forEach(button => button.remove());
  
  // Criar container para os botões
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'admin-button-container';
  
  // Criar botão de modo de edição
  const editModeBtn = document.createElement('button');
  editModeBtn.className = 'admin-button edit-mode';
  editModeBtn.innerHTML = '<i class="fas fa-edit"></i> Modo de Edição';
  
  // Adicionar ao container
  buttonContainer.appendChild(editModeBtn);
  
  // Event listener
  editModeBtn.addEventListener('click', toggleEditMode);
  
  // Criar botão para ver agendamentos
  const viewAppointmentsBtn = document.createElement('button');
  viewAppointmentsBtn.className = 'admin-button view-appointments';
  viewAppointmentsBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Ver Agendamentos';
  
  // Adicionar ao container
  buttonContainer.appendChild(viewAppointmentsBtn);
  
  // Event listener
  viewAppointmentsBtn.addEventListener('click', openAppointmentsModal);
  
  // Criar botão para personalizar cores
  const customizeColorsBtn = document.createElement('button');
  customizeColorsBtn.className = 'admin-button customize-colors';
  customizeColorsBtn.innerHTML = '<i class="fas fa-palette"></i> Personalizar Cores';
  
  // Adicionar ao container
  buttonContainer.appendChild(customizeColorsBtn);
  
  // Event listener
  customizeColorsBtn.addEventListener('click', openColorCustomizationModal);
  
  // Criar botão para estatísticas (apenas para desenvolvedor)
  const statsBtn = document.createElement('button');
  statsBtn.className = 'admin-button view-stats';
  statsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Estatísticas';
  
  // Adicionar ao container
  buttonContainer.appendChild(statsBtn);
  
  // Event listener
  statsBtn.addEventListener('click', openStatsModal);
  
  // Criar botão de logout
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'admin-button logout';
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
  
  // Adicionar ao container
  buttonContainer.appendChild(logoutBtn);
  
  // Event listener
  logoutBtn.addEventListener('click', logout);
  
  // Adicionar container ao DOM
  document.body.appendChild(buttonContainer);
}

// Criar painel de edição
function createEditPanel() {
  // Criar elemento do painel
  const editPanel = document.createElement('div');
  editPanel.className = 'edit-panel';
  editPanel.innerHTML = `
    <div class="edit-panel-header">
      <h3>Editar Elemento</h3>
      <span class="close-panel">&times;</span>
    </div>
    <div class="edit-form">
      <div id="edit-content-container"></div>
      <div class="edit-actions">
        <button class="btn primary-btn" id="save-edit-btn">Salvar</button>
        <button class="btn secondary-btn" id="cancel-edit-btn">Cancelar</button>
      </div>
    </div>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(editPanel);
  
  // Event listeners
  document.querySelector('.close-panel').addEventListener('click', closeEditPanel);
  document.getElementById('save-edit-btn').addEventListener('click', saveEdit);
  document.getElementById('cancel-edit-btn').addEventListener('click', closeEditPanel);
}

// Abrir modal de login
function openLoginModal() {
  if (isLoggedIn) {
    // Se já estiver logado, mostrar opções do profissional
    toggleEditMode();
  } else {
    // Abrir modal de login
    openModal(loginModal);
  }
}

// Abrir modal de agendamento
function openScheduleModal() {
  openModal(scheduleModal);
}

// Abrir modal de visualização de agendamentos
function openAppointmentsModal() {
  renderAppointments();
  openModal(appointmentsModal);
}

// Abrir modal genérico
function openModal(modal) {
  modal.style.display = 'flex';
}

// Fechar modal genérico
function closeModal(modal) {
  modal.style.display = 'none';
}

// Lidar com login
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Verificar credenciais
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Login bem-sucedido
    isLoggedIn = true;
    // Não salvar no localStorage para exigir login a cada acesso
    
    // Atualizar UI
    loginBtn.textContent = 'Área do Profissional';
    closeModal(loginModal);
    createEditModeButton();
    addLogoutButton();
    
    // Limpar formulário
    loginForm.reset();
    
    alert('Login realizado com sucesso! Agora você pode editar o site e gerenciar agendamentos.');
  } else {
    // Login falhou
    alert('Usuário ou senha incorretos. Tente novamente.');
  }
}

// Lidar com envio de agendamento
function handleScheduleSubmit(e) {
  e.preventDefault();
  
  // Obter dados do formulário
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const date = document.getElementById('schedule-date').value;
  const time = document.getElementById('schedule-time').value;
  const service = document.getElementById('service-type').value;
  const notes = document.getElementById('notes').value;
  
  // Criar objeto de agendamento
  const appointment = {
    id: Date.now(), // ID único baseado no timestamp
    name,
    phone,
    date,
    time,
    service,
    notes,
    status: APPOINTMENT_STATUS.PENDING,
    createdAt: new Date().toISOString()
  };
  
  // Adicionar ao array de agendamentos
  appointments.push(appointment);
  
  // Salvar no localStorage
  saveAppointments();
  
  // Limpar formulário
  scheduleForm.reset();
  
  // Fechar modal e mostrar mensagem
  closeModal(scheduleModal);
  alert('Agendamento solicitado com sucesso! Entraremos em contato para confirmar.');
}

// Salvar agendamentos no localStorage
function saveAppointments() {
  localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Alternar menu mobile
function toggleMenu() {
  navMenu.classList.toggle('active');
  menuToggle.classList.toggle('active');
}

// Smooth scroll para links de navegação
function smoothScroll(e) {
  e.preventDefault();
  
  const targetId = this.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  
  if (targetElement) {
    // Fechar menu mobile se estiver aberto
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
    }
    
    // Scroll suave
    window.scrollTo({
      top: targetElement.offsetTop - 70,
      behavior: 'smooth'
    });
  }
}

// Alternar modo de edição
function toggleEditMode() {
  isEditMode = !isEditMode;
  
  // Atualizar classe no body
  document.body.classList.toggle('edit-mode-active', isEditMode);
  
  // Atualizar texto do botão
  const editModeBtn = document.querySelector('.edit-mode');
  if (editModeBtn) {
    editModeBtn.innerHTML = isEditMode
      ? '<i class="fas fa-times"></i> Sair do Modo de Edição'
      : '<i class="fas fa-edit"></i> Modo de Edição';
  }
  
  // Mostrar/esconder overlays de edição
  toggleEditOverlays(isEditMode);
  
  // Adicionar/remover botão para adicionar imagem à galeria
  if (isEditMode) {
    addGalleryButton();
  } else {
    const addButton = document.getElementById('add-gallery-button');
    if (addButton) {
      addButton.remove();
    }
  }
  
  // Fechar painel de edição se estiver aberto
  if (!isEditMode) {
    closeEditPanel();
  }
}

// Mostrar/esconder overlays de edição
function toggleEditOverlays(show) {
  // Overlays de texto
  const textOverlays = document.querySelectorAll('.text-edit-overlay');
  textOverlays.forEach(overlay => {
    overlay.style.display = show ? 'flex' : 'none';
  });
  
  // Overlays de imagem
  const imageOverlays = document.querySelectorAll('.image-upload-overlay');
  imageOverlays.forEach(overlay => {
    overlay.style.display = show ? 'flex' : 'none';
  });
}

// Abrir painel de edição
function openEditPanel(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Encontrar o elemento editável
  const element = e.currentTarget;
  openEditPanelForElement(element);
}

// Abrir painel de edição para um elemento específico
function openEditPanelForElement(element) {
  const editableElement = findEditableElement(element);
  
  if (editableElement) {
    currentEditElement = editableElement;
    
    // Preencher o painel com o formulário apropriado
    const contentContainer = document.getElementById('edit-content-container');
    
    if (editableElement.type === 'text') {
      contentContainer.innerHTML = `
        <div class="form-group">
          <label for="edit-text">Texto</label>
          <textarea id="edit-text" rows="5">${element.textContent}</textarea>
        </div>
      `;
    } else if (editableElement.type === 'link') {
      contentContainer.innerHTML = `
        <div class="form-group">
          <label for="edit-link">Link</label>
          <input type="text" id="edit-link" value="${element.getAttribute(editableElement.urlAttribute)}">
        </div>
        <div class="form-group">
          <label for="edit-link-text">Texto do Link</label>
          <input type="text" id="edit-link-text" value="${element.textContent}">
        </div>
      `;
    } else if (editableElement.type === 'image') {
      contentContainer.innerHTML = `
        <div class="image-preview">
          <img src="${element.getAttribute(editableElement.urlAttribute)}" alt="Preview">
        </div>
        <div class="form-group">
          <label for="edit-image">URL da Imagem</label>
          <input type="text" id="edit-image" value="${element.getAttribute(editableElement.urlAttribute)}">
        </div>
        <div class="form-group">
          <label for="edit-image-upload">Ou faça upload de uma imagem</label>
          <input type="file" id="edit-image-upload" accept="image/*">
        </div>
        ${editableElement.id.startsWith('gallery-') ? `
          <div class="form-group">
            <button class="btn secondary-btn" onclick="removeGalleryImage('${editableElement.id}')">Remover da Galeria</button>
          </div>
        ` : ''}
      `;
      
      // Adicionar event listener para preview de imagem
      document.getElementById('edit-image-upload').addEventListener('change', previewImage);
      document.getElementById('edit-image').addEventListener('input', updateImagePreview);
    }
    
    // Abrir o painel
    document.querySelector('.edit-panel').classList.add('active');
  }
}

// Fechar painel de edição
function closeEditPanel() {
  document.querySelector('.edit-panel').classList.remove('active');
  currentEditElement = null;
}

// Salvar edição
function saveEdit() {
  if (!currentEditElement) return;
  
  const element = document.querySelector(currentEditElement.selector);
  
  if (element) {
    if (currentEditElement.type === 'text') {
      const newText = document.getElementById('edit-text').value;
      element.textContent = newText;
      localStorage.setItem(currentEditElement.id, newText);
    } else if (currentEditElement.type === 'link') {
      const newLink = document.getElementById('edit-link').value;
      const newText = document.getElementById('edit-link-text').value;
      element.setAttribute(currentEditElement.urlAttribute, newLink);
      element.textContent = newText;
      localStorage.setItem(currentEditElement.id, newLink);
      localStorage.setItem(`${currentEditElement.id}-text`, newText);
    } else if (currentEditElement.type === 'image') {
      const newImageUrl = document.getElementById('edit-image').value;
      element.setAttribute(currentEditElement.urlAttribute, newImageUrl);
      localStorage.setItem(currentEditElement.id, newImageUrl);
    }
    
    closeEditPanel();
    alert('Alterações salvas com sucesso!');
  }
}

// Encontrar elemento editável
function findEditableElement(domElement) {
  return editableElements.find(item => {
    return domElement === document.querySelector(item.selector);
  });
}

// Preview de imagem
function previewImage(e) {
  const file = e.target.files[0];
  
  if (file) {
    // Verificar tamanho do arquivo
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`O arquivo é muito grande. O tamanho máximo é ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
      e.target.value = '';
      return;
    }
    
    // Verificar tipo do arquivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WEBP.');
      e.target.value = '';
      return;
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
      // Atualizar preview
      const previewImg = document.querySelector('.image-preview img');
      if (previewImg) {
        previewImg.src = event.target.result;
        
        // Atualizar campo de URL
        const urlField = document.getElementById('edit-image');
        if (urlField) {
          urlField.value = event.target.result;
        }
      }
    };
    
    reader.readAsDataURL(file);
  }
}

// Atualizar preview de imagem
function updateImagePreview() {
  const imageUrl = document.getElementById('edit-image').value;
  const previewImg = document.querySelector('.image-preview img');
  if (previewImg) {
    previewImg.src = imageUrl;
  }
}

// Adicionar nova imagem à galeria
function addGalleryImage() {
  // Criar novo ID para a imagem
  const newId = `gallery-${Date.now()}`;
  
  // Criar novo elemento na galeria
  const galleryGrid = document.querySelector('.gallery-grid');
  const newItem = document.createElement('div');
  newItem.className = 'gallery-item';
  newItem.dataset.id = newId;
  
  // Adicionar imagem padrão
  newItem.innerHTML = `<img src="../fisioterapia.png" alt="Nova imagem da galeria">`;
  
  // Adicionar ao DOM
  galleryGrid.appendChild(newItem);
  
  // Adicionar à lista de elementos editáveis
  editableElements.push({
    id: newId,
    selector: `[data-id="${newId}"] img`,
    type: 'image',
    urlAttribute: 'src'
  });
  
  // Se estiver em modo de edição, adicionar classe e event listener
  if (isEditMode) {
    newItem.classList.add('editable');
    newItem.addEventListener('click', openEditPanel);
  }
  
  // Abrir painel de edição para a nova imagem
  if (isEditMode) {
    currentEditElement = editableElements[editableElements.length - 1];
    openEditPanelForElement(newItem.querySelector('img'));
  }
}

// Remover imagem da galeria
function removeGalleryImage(id) {
  // Confirmar remoção
  if (confirm('Tem certeza que deseja remover esta imagem da galeria?')) {
    // Remover do DOM
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.remove();
    }
    
    // Remover da lista de elementos editáveis
    const index = editableElements.findIndex(el => el.id === id);
    if (index !== -1) {
      editableElements.splice(index, 1);
    }
    
    // Remover do localStorage
    localStorage.removeItem(id);
    
    // Fechar painel de edição
    closeEditPanel();
  }
}

// Adicionar botão para adicionar imagem à galeria
function addGalleryButton() {
  // Verificar se já existe
  if (document.getElementById('add-gallery-button')) {
    return;
  }
  
  // Criar botão
  const gallerySection = document.getElementById('galeria');
  const galleryGrid = gallerySection.querySelector('.gallery-grid');
  
  const addButton = document.createElement('button');
  addButton.id = 'add-gallery-button';
  addButton.className = 'btn primary-btn add-gallery-btn';
  addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar Imagem';
  addButton.addEventListener('click', addGalleryImage);
  
  // Adicionar antes da grade de galeria
  gallerySection.querySelector('.container').insertBefore(addButton, galleryGrid);
  
  // Adicionar estilo
  const style = document.createElement('style');
  style.textContent = `
    .add-gallery-btn {
      margin: 20px auto;
      display: block;
    }
  `;
  document.head.appendChild(style);
}

// Renderizar lista de agendamentos
function renderAppointments() {
  // Limpar lista
  appointmentsList.innerHTML = '';
  
  // Verificar se há agendamentos
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<p class="no-appointments">Nenhum agendamento encontrado.</p>';
    return;
  }
  
  // Obter filtro de data
  const filterDate = document.getElementById('filter-date').value;
  
  // Filtrar e ordenar agendamentos
  let filteredAppointments = [...appointments];
  
  if (filterDate) {
    filteredAppointments = filteredAppointments.filter(app => app.date === filterDate);
  }
  
  // Ordenar por data e hora
  filteredAppointments.sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return a.time.localeCompare(b.time);
  });
  
  // Verificar se há agendamentos após filtro
  if (filteredAppointments.length === 0) {
    appointmentsList.innerHTML = '<p class="no-appointments">Nenhum agendamento encontrado para esta data.</p>';
    return;
  }
  
  // Renderizar cada agendamento
  filteredAppointments.forEach(appointment => {
    const card = document.createElement('div');
    card.className = `appointment-card ${appointment.status}`;
    card.dataset.id = appointment.id;
    
    // Formatar data
    const dateObj = new Date(appointment.date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Status em português
    let statusText = 'Pendente';
    if (appointment.status === APPOINTMENT_STATUS.CONFIRMED) {
      statusText = 'Confirmado';
    } else if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
      statusText = 'Cancelado';
    }
    
    card.innerHTML = `
      <div class="appointment-header">
        <span class="appointment-date">${formattedDate} - ${appointment.time}</span>
        <span class="appointment-status ${appointment.status}">${statusText}</span>
      </div>
      <div class="appointment-details">
        <p><strong>Paciente:</strong> ${appointment.name}</p>
        <p><strong>Telefone:</strong> ${appointment.phone}</p>
        <p><strong>Serviço:</strong> ${appointment.service}</p>
        ${appointment.notes ? `<p><strong>Observações:</strong> ${appointment.notes}</p>` : ''}
      </div>
      <div class="appointment-actions">
        ${appointment.status === APPOINTMENT_STATUS.PENDING ? `
          <button class="btn primary-btn" onclick="updateAppointmentStatus(${appointment.id}, '${APPOINTMENT_STATUS.CONFIRMED}')">Confirmar</button>
          <button class="btn secondary-btn" onclick="updateAppointmentStatus(${appointment.id}, '${APPOINTMENT_STATUS.CANCELLED}')">Cancelar</button>
        ` : ''}
        ${appointment.status === APPOINTMENT_STATUS.CONFIRMED ? `
          <button class="btn secondary-btn" onclick="updateAppointmentStatus(${appointment.id}, '${APPOINTMENT_STATUS.CANCELLED}')">Cancelar</button>
        ` : ''}
        <button class="btn secondary-btn" onclick="deleteAppointment(${appointment.id})">Excluir</button>
      </div>
    `;
    
    appointmentsList.appendChild(card);
  });
}

// Atualizar status de agendamento
function updateAppointmentStatus(id, newStatus) {
  // Encontrar agendamento
  const appointmentIndex = appointments.findIndex(app => app.id === id);
  
  if (appointmentIndex !== -1) {
    // Atualizar status
    appointments[appointmentIndex].status = newStatus;
    
    // Salvar no localStorage
    saveAppointments();
    
    // Atualizar UI
    renderAppointments();
    
    // Mostrar mensagem
    alert(`Status do agendamento atualizado para ${newStatus === APPOINTMENT_STATUS.CONFIRMED ? 'Confirmado' : 'Cancelado'}.`);
  }
}

// Excluir agendamento
function deleteAppointment(id) {
  // Confirmar exclusão
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    // Filtrar agendamento
    appointments = appointments.filter(app => app.id !== id);
    
    // Salvar no localStorage
    saveAppointments();
    
    // Atualizar UI
    renderAppointments();
    
    // Mostrar mensagem
    alert('Agendamento excluído com sucesso.');
  }
}

// Filtrar agendamentos por data
function filterAppointments() {
  renderAppointments();
}

// Limpar filtro de agendamentos
function clearAppointmentFilter() {
  document.getElementById('filter-date').value = '';
  renderAppointments();
}

// Adicionar botão de logout
function addLogoutButton() {
  // Verificar se já existe
  if (document.getElementById('logout-btn')) {
    return;
  }
  
  // Criar botão de logout
  const logoutBtn = document.createElement('li');
  logoutBtn.innerHTML = '<a href="#" class="nav-link logout-nav-btn" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Sair</a>';
  
  // Adicionar ao menu de navegação
  const navMenu = document.querySelector('.nav-menu ul');
  navMenu.appendChild(logoutBtn);
  
  // Adicionar estilo
  const style = document.createElement('style');
  style.textContent = `
    .logout-nav-btn {
      background: #dc3545;
      color: white !important;
      padding: 8px 16px !important;
      border-radius: var(--radius-md);
    }
    
    .logout-nav-btn:hover {
      background: #c82333;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
  
  // Adicionar event listener
  document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    logout();
  });
}

// Logout
function logout() {
  isLoggedIn = false;
  isEditMode = false;
  localStorage.removeItem('isLoggedIn');
  
  // Atualizar UI
  loginBtn.textContent = 'Área do Profissional';
  document.body.classList.remove('edit-mode-active');
  
  // Remover botões
  const editModeBtn = document.querySelector('.edit-mode');
  if (editModeBtn) {
    editModeBtn.remove();
  }
  
  // Remover botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.parentElement.remove();
  }
  
  // Remover botões de admin
  const adminButtons = document.querySelector('.admin-button-container');
  if (adminButtons) {
    adminButtons.remove();
  }
  
  // Remover classe 'editable' e event listeners
  editableElements.forEach(element => {
    const domElement = document.querySelector(element.selector);
    
    if (domElement) {
      domElement.classList.remove('editable');
      domElement.removeEventListener('click', openEditPanel);
    }
  });
  
  // Esconder overlays
  toggleEditOverlays(false);
  
  alert('Logout realizado com sucesso!');
}

// ===== Funcionalidades de Edição Direta de Texto =====

// Criar modal de edição de texto
function createTextEditModal() {
  // Verificar se já existe
  if (document.getElementById('text-edit-modal')) {
    return;
  }
  
  // Criar elemento do modal
  const modal = document.createElement('div');
  modal.id = 'text-edit-modal';
  modal.className = 'text-edit-modal';
  modal.innerHTML = `
    <div class="text-edit-content">
      <span class="close-modal">&times;</span>
      <h2>Editar Texto</h2>
      <div class="form-group">
        <label for="edit-text-content">Conteúdo</label>
        <textarea id="edit-text-content" rows="5"></textarea>
      </div>
      <div class="text-edit-actions">
        <button class="btn primary-btn" id="save-text-btn">Salvar</button>
        <button class="btn secondary-btn" id="cancel-text-btn">Cancelar</button>
      </div>
    </div>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(modal);
  
  // Salvar referência
  textEditModal = modal;
  
  // Event listeners
  modal.querySelector('.close-modal').addEventListener('click', closeTextEditModal);
  document.getElementById('save-text-btn').addEventListener('click', saveEditedText);
  document.getElementById('cancel-text-btn').addEventListener('click', closeTextEditModal);
  
  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeTextEditModal();
    }
  });
}

// Adicionar overlays de edição de texto
function addTextEditOverlays() {
  // Selecionar todos os textos que podem ser editados
  const editableTexts = [
    // Títulos e descrições de seções
    { selector: '.welcome-content .section-title', id: 'welcome-title' },
    { selector: '.welcome-content .section-description', id: 'welcome-description' },
    { selector: '#servicos .section-title', id: 'services-title' },
    { selector: '#servicos .section-description', id: 'services-description' },
    { selector: '#galeria .section-title', id: 'gallery-title' },
    { selector: '#galeria .section-description', id: 'gallery-description' },
    { selector: '#contato .section-title', id: 'contact-title' },
    { selector: '#contato .section-description', id: 'contact-description' },
    
    // Informações de contato
    { selector: '#address-text', id: 'address-text' },
    { selector: '#hours-text', id: 'hours-text' },
    { selector: '#whatsapp-link', id: 'whatsapp-link' },
    { selector: '#instagram-link', id: 'instagram-link' },
    
    // Serviços
    { selector: '[data-id="service-1"] h3', id: 'service-1-title' },
    { selector: '[data-id="service-1"] p', id: 'service-1-description' },
    { selector: '[data-id="service-2"] h3', id: 'service-2-title' },
    { selector: '[data-id="service-2"] p', id: 'service-2-description' },
    { selector: '[data-id="service-3"] h3', id: 'service-3-title' },
    { selector: '[data-id="service-3"] p', id: 'service-3-description' },
    { selector: '[data-id="service-4"] h3', id: 'service-4-title' },
    { selector: '[data-id="service-4"] p', id: 'service-4-description' },
    
    // Botões
    { selector: '.welcome-buttons .primary-btn', id: 'welcome-primary-btn' },
    { selector: '.welcome-buttons .secondary-btn', id: 'welcome-secondary-btn' },
    
    // Navegação
    { selector: '.logo h1', id: 'nav-logo-title' },
    { selector: '.logo p', id: 'nav-logo-subtitle' },
    { selector: '.nav-menu ul li:nth-child(1) a', id: 'nav-link-1' },
    { selector: '.nav-menu ul li:nth-child(2) a', id: 'nav-link-2' },
    { selector: '.nav-menu ul li:nth-child(3) a', id: 'nav-link-3' },
    { selector: '.nav-menu ul li:nth-child(4) a', id: 'nav-link-4' },
    { selector: '.nav-menu ul li:nth-child(5) a', id: 'nav-link-5' },
    { selector: '.nav-menu ul li:nth-child(6) a', id: 'nav-link-6' },
    
    // Modais
    { selector: '#schedule-modal h2', id: 'schedule-modal-title' },
    { selector: '#login-modal h2', id: 'login-modal-title' },
    { selector: '#appointments-modal h2', id: 'appointments-modal-title' },
    
    // Labels de formulários
    { selector: 'label[for="name"]', id: 'label-name' },
    { selector: 'label[for="phone"]', id: 'label-phone' },
    { selector: 'label[for="schedule-date"]', id: 'label-date' },
    { selector: 'label[for="schedule-time"]', id: 'label-time' },
    { selector: 'label[for="service-type"]', id: 'label-service' },
    { selector: 'label[for="notes"]', id: 'label-notes' },
    { selector: 'label[for="username"]', id: 'label-username' },
    { selector: 'label[for="password"]', id: 'label-password' },
    
    // Opções de serviços no formulário
    { selector: '#service-type option[value="Fisioterapia Ortopédica"]', id: 'service-option-1' },
    { selector: '#service-type option[value="Fisioterapia Neurológica"]', id: 'service-option-2' },
    { selector: '#service-type option[value="Pilates Terapêutico"]', id: 'service-option-3' },
    { selector: '#service-type option[value="Fisioterapia Esportiva"]', id: 'service-option-4' },
    
    // Footer
    { selector: '.footer-logo h2', id: 'footer-title' },
    { selector: '.footer-logo p', id: 'footer-subtitle' },
    { selector: '.footer-links h3', id: 'footer-links-title' },
    { selector: '.footer-links ul li:nth-child(1) a', id: 'footer-link-1' },
    { selector: '.footer-links ul li:nth-child(2) a', id: 'footer-link-2' },
    { selector: '.footer-links ul li:nth-child(3) a', id: 'footer-link-3' },
    { selector: '.footer-links ul li:nth-child(4) a', id: 'footer-link-4' },
    { selector: '.footer-social h3', id: 'footer-social-title' },
    { selector: '.footer-bottom p', id: 'footer-copyright' }
  ];
  
  // Para cada texto, adicionar o overlay
  editableTexts.forEach(item => {
    const textElement = document.querySelector(item.selector);
    if (textElement) {
      addTextEditOverlay(textElement, item.id);
    }
  });
  
  // Adicionar capacidade de editar qualquer texto no site
  addEditCapabilityToAllTexts();
}

// Adicionar capacidade de edição a todos os textos do site
function addEditCapabilityToAllTexts() {
  // Selecionar todos os elementos de texto que não têm overlay ainda
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, button, label, option');
  
  textElements.forEach((element, index) => {
    // Verificar se o elemento já está dentro de um container de edição
    if (!element.closest('.text-edit-container') && !element.closest('.edit-panel') &&
        !element.closest('.modal-content') && element.textContent.trim() !== '') {
      
      // Criar ID único para este elemento
      const uniqueId = `dynamic-text-${index}`;
      
      // Adicionar overlay de edição
      addTextEditOverlay(element, uniqueId);
    }
  });
}

// Adicionar overlay de edição para um texto específico
function addTextEditOverlay(textElement, textId) {
  // Criar container
  const container = document.createElement('div');
  container.className = 'text-edit-container';
  
  // Substituir o elemento original pelo container
  textElement.parentNode.insertBefore(container, textElement);
  container.appendChild(textElement);
  
  // Criar overlay
  const overlay = document.createElement('div');
  overlay.className = 'text-edit-overlay';
  overlay.innerHTML = `
    <div class="text-edit-icon">
      <i class="fas fa-edit"></i>
    </div>
  `;
  overlay.setAttribute('data-text-id', textId);
  
  // Adicionar ao container
  container.appendChild(overlay);
  
  // Event listener para o overlay
  overlay.addEventListener('click', handleTextEdit);
}

// Manipular edição de texto
function handleTextEdit(e) {
  const textId = e.currentTarget.getAttribute('data-text-id');
  const textElement = e.currentTarget.parentNode.querySelector(':not(.text-edit-overlay)');
  
  // Salvar referência ao elemento atual
  currentTextElement = {
    textId: textId,
    element: textElement
  };
  
  // Preencher o textarea com o texto atual
  const textareaElement = document.getElementById('edit-text-content');
  if (textareaElement) {
    textareaElement.value = textElement.textContent.trim();
  }
  
  // Mostrar o modal
  if (textEditModal) {
    textEditModal.style.display = 'flex';
  }
}

// Fechar modal de edição de texto
function closeTextEditModal() {
  textEditModal.style.display = 'none';
  currentTextElement = null;
}

// Salvar texto editado
function saveEditedText() {
  if (!currentTextElement) return;
  
  // Obter novo texto
  const newText = document.getElementById('edit-text-content').value;
  
  // Atualizar o texto no DOM
  currentTextElement.element.textContent = newText;
  
  // Salvar no localStorage
  localStorage.setItem(currentTextElement.textId, newText);
  
  // Fechar o modal
  closeTextEditModal();
  
  // Mostrar mensagem de sucesso
  alert('Texto atualizado com sucesso!');
}

// ===== Funcionalidades de Upload Direto de Imagem =====

// Criar modal de preview de imagem
function createImagePreviewModal() {
  // Verificar se já existe
  if (document.getElementById('image-preview-modal')) {
    return;
  }
  
  // Criar elemento do modal
  const modal = document.createElement('div');
  modal.id = 'image-preview-modal';
  modal.className = 'image-preview-modal';
  modal.innerHTML = `
    <div class="image-preview-content">
      <span class="close-modal">&times;</span>
      <h2>Pré-visualização da Imagem</h2>
      <div class="image-preview-container">
        <img src="" alt="Preview da imagem">
      </div>
      <div class="image-preview-actions">
        <button class="btn primary-btn" id="save-image-btn">Salvar Imagem</button>
        <button class="btn secondary-btn" id="cancel-image-btn">Cancelar</button>
      </div>
    </div>
  `;
  
  // Adicionar ao DOM
  document.body.appendChild(modal);
  
  // Salvar referência
  imagePreviewModal = modal;
  
  // Event listeners
  modal.querySelector('.close-modal').addEventListener('click', closeImagePreviewModal);
  document.getElementById('save-image-btn').addEventListener('click', saveUploadedImage);
  document.getElementById('cancel-image-btn').addEventListener('click', closeImagePreviewModal);
  
  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeImagePreviewModal();
    }
  });
}

// Adicionar overlays de upload de imagem
function addImageUploadOverlays() {
  // Selecionar todas as imagens que podem ser alteradas
  const uploadableImages = [
    // Imagem de boas-vindas
    { selector: '.welcome-image img', id: 'welcome-image' },
    
    // Imagens de serviços
    { selector: '[data-id="service-1"] img', id: 'service-1-image' },
    { selector: '[data-id="service-2"] img', id: 'service-2-image' },
    { selector: '[data-id="service-3"] img', id: 'service-3-image' },
    { selector: '[data-id="service-4"] img', id: 'service-4-image' },
    
    // Imagens da galeria
    { selector: '[data-id="gallery-1"] img', id: 'gallery-1-image' },
    { selector: '[data-id="gallery-2"] img', id: 'gallery-2-image' },
    { selector: '[data-id="gallery-3"] img', id: 'gallery-3-image' },
    { selector: '[data-id="gallery-4"] img', id: 'gallery-4-image' },
    { selector: '[data-id="gallery-5"] img', id: 'gallery-5-image' },
    { selector: '[data-id="gallery-6"] img', id: 'gallery-6-image' }
  ];
  
  // Para cada imagem, adicionar o overlay
  uploadableImages.forEach(item => {
    const imgElement = document.querySelector(item.selector);
    if (imgElement) {
      addImageUploadOverlay(imgElement, item.id);
    }
  });
}

// Adicionar overlay de upload para uma imagem específica
function addImageUploadOverlay(imgElement, imageId) {
  // Obter o elemento pai
  const parent = imgElement.parentElement;
  
  // Adicionar classe para posicionamento relativo
  parent.classList.add('image-upload-container');
  
  // Criar overlay
  const overlay = document.createElement('div');
  overlay.className = 'image-upload-overlay';
  overlay.innerHTML = `
    <i class="fas fa-camera image-upload-icon"></i>
    <p class="image-upload-text">Clique para alterar a imagem</p>
    <input type="file" class="image-upload-input" accept="image/*" data-image-id="${imageId}">
  `;
  
  // Adicionar ao DOM
  parent.appendChild(overlay);
  
  // Event listener para o input de arquivo
  const fileInput = overlay.querySelector('.image-upload-input');
  fileInput.addEventListener('change', handleDirectImageUpload);
}

// Manipular upload direto de imagem
function handleDirectImageUpload(e) {
  const file = e.target.files[0];
  const imageId = e.target.getAttribute('data-image-id');
  
  if (!file) return;
  
  // Verificar tamanho do arquivo
  if (file.size > MAX_IMAGE_SIZE) {
    alert(`O arquivo é muito grande. O tamanho máximo é ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
    e.target.value = '';
    return;
  }
  
  // Verificar tipo do arquivo
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    alert('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WEBP.');
    e.target.value = '';
    return;
  }
  
  // Limpar o input para permitir selecionar o mesmo arquivo novamente
  e.target.value = '';
  
  // Salvar referência ao elemento atual
  currentUploadElement = {
    imageId: imageId,
    element: document.querySelector(`[data-image-id="${imageId}"]`).closest('.image-upload-container').querySelector('img')
  };
  
  // Ler o arquivo
  const reader = new FileReader();
  reader.onload = function(event) {
    // Mostrar preview
    showImagePreview(event.target.result);
  };
  reader.readAsDataURL(file);
}

// Mostrar preview da imagem
function showImagePreview(dataUrl) {
  // Definir a imagem no preview
  imagePreviewModal.querySelector('.image-preview-container img').src = dataUrl;
  
  // Mostrar o modal
  imagePreviewModal.style.display = 'flex';
}

// Fechar modal de preview
function closeImagePreviewModal() {
  imagePreviewModal.style.display = 'none';
  currentUploadElement = null;
}

// ===== Funcionalidades de Personalização de Cores =====

// Abrir modal de personalização de cores
function openColorCustomizationModal() {
  // Verificar se já existe
  let colorModal = document.getElementById('color-customization-modal');
  
  if (!colorModal) {
    // Criar modal
    colorModal = document.createElement('div');
    colorModal.id = 'color-customization-modal';
    colorModal.className = 'color-customization-modal';
    
    // Conteúdo do modal
    colorModal.innerHTML = `
      <div class="color-customization-content">
        <span class="close-modal">&times;</span>
        <h2>Personalizar Cores do Site</h2>
        
        <div class="color-preview" id="color-preview">
          Pré-visualização
        </div>
        
        <div class="color-presets-container">
          <div class="color-preset" style="background-color: #8a5a44;" data-primary="#8a5a44" data-accent="#e9c46a"></div>
          <div class="color-preset" style="background-color: #2a9d8f;" data-primary="#2a9d8f" data-accent="#e9c46a"></div>
          <div class="color-preset" style="background-color: #457b9d;" data-primary="#457b9d" data-accent="#e76f51"></div>
          <div class="color-preset" style="background-color: #6a0572;" data-primary="#6a0572" data-accent="#f72585"></div>
          <div class="color-preset" style="background-color: #264653;" data-primary="#264653" data-accent="#e9c46a"></div>
        </div>
        
        <div class="color-picker-group">
          <div class="form-group">
            <label for="primary-color">Cor Principal</label>
            <input type="color" id="primary-color" value="#8a5a44">
            <p class="color-help">Usada em botões, cabeçalhos e destaques</p>
          </div>
          
          <div class="form-group">
            <label for="accent-color">Cor de Destaque</label>
            <input type="color" id="accent-color" value="#e9c46a">
            <p class="color-help">Usada em elementos de destaque e detalhes</p>
          </div>
        </div>
        
        <div class="color-actions">
          <button class="btn primary-btn" id="apply-colors-btn">Aplicar Cores</button>
          <button class="btn secondary-btn" id="reset-colors-btn">Restaurar Padrão</button>
          <button class="btn secondary-btn" id="cancel-colors-btn">Cancelar</button>
        </div>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(colorModal);
    
    // Event listeners
    colorModal.querySelector('.close-modal').addEventListener('click', closeColorModal);
    document.getElementById('apply-colors-btn').addEventListener('click', applyCustomColors);
    document.getElementById('reset-colors-btn').addEventListener('click', resetColors);
    document.getElementById('cancel-colors-btn').addEventListener('click', closeColorModal);
    document.getElementById('primary-color').addEventListener('input', updateColorPreview);
    document.getElementById('accent-color').addEventListener('input', updateColorPreview);
    
    // Event listeners para presets de cores
    const presets = colorModal.querySelectorAll('.color-preset');
    presets.forEach(preset => {
      preset.addEventListener('click', function() {
        const primaryColor = this.getAttribute('data-primary');
        const accentColor = this.getAttribute('data-accent');
        
        document.getElementById('primary-color').value = primaryColor;
        document.getElementById('accent-color').value = accentColor;
        
        updateColorPreview();
        
        // Marcar preset ativo
        presets.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Marcar o primeiro preset como ativo por padrão
    presets[0].classList.add('active');
    
    // Fechar ao clicar fora
    colorModal.addEventListener('click', (e) => {
      if (e.target === colorModal) {
        closeColorModal();
      }
    });
  }
  
  // Carregar cores atuais
  loadCurrentColors();
  
  // Mostrar modal
  colorModal.style.display = 'flex';
}

// Fechar modal de cores
function closeColorModal() {
  const colorModal = document.getElementById('color-customization-modal');
  if (colorModal) {
    colorModal.style.display = 'none';
  }
}

// Carregar cores atuais
function loadCurrentColors() {
  // Obter cores do CSS
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
  const accentColor = rootStyles.getPropertyValue('--accent-color').trim();
  
  // Definir nos inputs
  const primaryInput = document.getElementById('primary-color');
  const accentInput = document.getElementById('accent-color');
  
  if (primaryInput && primaryColor) {
    primaryInput.value = primaryColor;
  }
  
  if (accentInput && accentColor) {
    accentInput.value = accentColor;
  }
  
  // Atualizar preview
  updateColorPreview();
}

// Atualizar preview de cores
function updateColorPreview() {
  const primaryColor = document.getElementById('primary-color').value;
  const accentColor = document.getElementById('accent-color').value;
  const preview = document.getElementById('color-preview');
  
  if (preview) {
    preview.style.background = `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`;
    preview.style.borderBottom = `5px solid ${accentColor}`;
  }
}

// Aplicar cores personalizadas
function applyCustomColors() {
  const primaryColor = document.getElementById('primary-color').value;
  const accentColor = document.getElementById('accent-color').value;
  
  // Calcular cores derivadas
  const primaryDark = adjustColor(primaryColor, -20);
  const primaryLight = adjustColor(primaryColor, 30);
  
  // Aplicar ao :root
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--primary-dark', primaryDark);
  document.documentElement.style.setProperty('--primary-light', primaryLight);
  document.documentElement.style.setProperty('--accent-color', accentColor);
  document.documentElement.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`);
  
  // Salvar no localStorage
  localStorage.setItem('site-primary-color', primaryColor);
  localStorage.setItem('site-accent-color', accentColor);
  
  // Fechar modal
  closeColorModal();
  
  // Mostrar mensagem
  alert('Cores do site atualizadas com sucesso!');
}

// Resetar cores para o padrão
function resetColors() {
  // Cores padrão
  const defaultPrimary = '#8a5a44';
  const defaultAccent = '#e9c46a';
  const defaultPrimaryDark = '#5d3c2e';
  const defaultPrimaryLight = '#c49a83';
  
  // Aplicar ao :root
  document.documentElement.style.setProperty('--primary-color', defaultPrimary);
  document.documentElement.style.setProperty('--primary-dark', defaultPrimaryDark);
  document.documentElement.style.setProperty('--primary-light', defaultPrimaryLight);
  document.documentElement.style.setProperty('--accent-color', defaultAccent);
  document.documentElement.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${defaultPrimary}, ${defaultPrimaryDark})`);
  
  // Atualizar inputs
  document.getElementById('primary-color').value = defaultPrimary;
  document.getElementById('accent-color').value = defaultAccent;
  
  // Atualizar preview
  updateColorPreview();
  
  // Remover do localStorage
  localStorage.removeItem('site-primary-color');
  localStorage.removeItem('site-accent-color');
  
  // Mostrar mensagem
  alert('Cores do site restauradas para o padrão!');
}

// Ajustar cor (clarear ou escurecer)
function adjustColor(color, amount) {
  // Converter para RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Ajustar valores
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Converter de volta para hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Carregar cores salvas ao iniciar
function loadSavedColors() {
  const savedPrimary = localStorage.getItem('site-primary-color');
  const savedAccent = localStorage.getItem('site-accent-color');
  
  if (savedPrimary && savedAccent) {
    // Calcular cores derivadas
    const primaryDark = adjustColor(savedPrimary, -20);
    const primaryLight = adjustColor(savedPrimary, 30);
    
    // Aplicar ao :root
    document.documentElement.style.setProperty('--primary-color', savedPrimary);
    document.documentElement.style.setProperty('--primary-dark', primaryDark);
    document.documentElement.style.setProperty('--primary-light', primaryLight);
    document.documentElement.style.setProperty('--accent-color', savedAccent);
    document.documentElement.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${savedPrimary}, ${primaryDark})`);
  }
}

// ===== Funcionalidades de Estatísticas de Acesso =====

// Abrir modal de estatísticas
function openStatsModal() {
  // Verificar se é desenvolvedor
  if (ADMIN_USERNAME !== 'fabianadias_fisio' || !isLoggedIn) {
    alert('Esta funcionalidade está disponível apenas para desenvolvedores.');
    return;
  }
  
  // Verificar se já existe
  let statsModal = document.getElementById('stats-modal');
  
  if (!statsModal) {
    // Criar modal
    statsModal = document.createElement('div');
    statsModal.id = 'stats-modal';
    statsModal.className = 'modal';
    
    // Conteúdo do modal
    statsModal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Estatísticas de Acesso</h2>
        
        <div class="stats-container">
          <div class="stats-card">
            <h3>Visitas Totais</h3>
            <p class="stats-number">1,245</p>
          </div>
          
          <div class="stats-card">
            <h3>Visitas Hoje</h3>
            <p class="stats-number">37</p>
          </div>
          
          <div class="stats-card">
            <h3>Agendamentos</h3>
            <p class="stats-number">${appointments.length}</p>
          </div>
          
          <div class="stats-card">
            <h3>Taxa de Conversão</h3>
            <p class="stats-number">${((appointments.length / 1245) * 100).toFixed(1)}%</p>
          </div>
        </div>
        
        <div class="stats-section">
          <h3>Dispositivos</h3>
          <div class="stats-bar-container">
            <div class="stats-bar" style="width: 65%;">Mobile (65%)</div>
            <div class="stats-bar" style="width: 25%;">Desktop (25%)</div>
            <div class="stats-bar" style="width: 10%;">Tablet (10%)</div>
          </div>
        </div>
        
        <div class="stats-section">
          <h3>Páginas Mais Visitadas</h3>
          <ul class="stats-list">
            <li>Página Inicial (100%)</li>
            <li>Serviços (78%)</li>
            <li>Contato (45%)</li>
            <li>Galeria (32%)</li>
          </ul>
        </div>
        
        <p class="stats-note">Nota: Estas são estatísticas simuladas para fins de demonstração.</p>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(statsModal);
    
    // Event listeners
    statsModal.querySelector('.close-modal').addEventListener('click', () => {
      statsModal.style.display = 'none';
    });
    
    // Fechar ao clicar fora
    statsModal.addEventListener('click', (e) => {
      if (e.target === statsModal) {
        statsModal.style.display = 'none';
      }
    });
    
    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
      .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .stats-card {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .stats-number {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary-color);
      }
      
      .stats-section {
        margin-bottom: 20px;
      }
      
      .stats-bar-container {
        width: 100%;
        margin-top: 10px;
      }
      
      .stats-bar {
        background: var(--primary-color);
        color: white;
        padding: 8px;
        margin-bottom: 5px;
        border-radius: 4px;
      }
      
      .stats-list {
        list-style: none;
        padding: 0;
      }
      
      .stats-list li {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      
      .stats-note {
        font-style: italic;
        color: #999;
        text-align: center;
        margin-top: 20px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Mostrar modal
  statsModal.style.display = 'flex';
}

// Adicionar carregamento de cores salvas à inicialização
document.addEventListener('DOMContentLoaded', function() {
  loadSavedColors();
});

// Salvar imagem carregada
function saveUploadedImage() {
  if (!currentUploadElement) return;
  
  // Obter URL da imagem do preview
  const imageUrl = imagePreviewModal.querySelector('.image-preview-container img').src;
  
  // Atualizar a imagem no DOM
  currentUploadElement.element.src = imageUrl;
  
  // Salvar no localStorage
  localStorage.setItem(currentUploadElement.imageId, imageUrl);
  
  // Fechar o modal
  closeImagePreviewModal();
  
  // Mostrar mensagem de sucesso
  alert('Imagem atualizada com sucesso!');
}