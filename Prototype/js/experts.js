/* Funcionalidades da entidade Experts. */
(function () {
  'use strict';

  const Store = window.AnimalecStorage;
  const listView = document.getElementById('list-view');
  const formView = document.getElementById('form-view');
  const detailView = document.getElementById('detail-view');
  const form = document.getElementById('expert-form');
  const tableBody = document.getElementById('experts-table-body');
  const emptyMessage = document.getElementById('experts-empty');
  const searchInput = document.getElementById('expert-search');
  const animalOptions = document.getElementById('expert-animals');
  let currentDetailId = null;

  function records() { return Store.read('experts'); }

  function showView(view) {
    listView.hidden = view !== 'list';
    formView.hidden = view !== 'form';
    detailView.hidden = view !== 'detail';
  }

  function renderList() {
    const query = searchInput.value.trim().toLocaleLowerCase('pt-PT');
    const filtered = records().filter(record =>
      [record.name, record.email, record.institution, record.specialty, record.taxonomy, record.biography, ...Store.animalNames(record.animalIds)]
        .join(' ').toLocaleLowerCase('pt-PT').includes(query)
    );

    tableBody.innerHTML = filtered.map(record => `
      <tr>
        <td>${Store.escapeHTML(record.name)}</td>
        <td>${Store.escapeHTML(record.institution || '—')}</td>
        <td>${Store.escapeHTML(record.specialty || '—')}</td>
        <td>${Store.escapeHTML(record.taxonomy || '—')}</td>
        <td>
          <div class="actions">
            <button class="button button-small" type="button" data-action="view" data-id="${Store.escapeHTML(record.id)}">VER</button>
            <button class="button button-small" type="button" data-action="edit" data-id="${Store.escapeHTML(record.id)}">EDITAR</button>
            <button class="button button-danger button-small" type="button" data-action="delete" data-id="${Store.escapeHTML(record.id)}">REMOVER</button>
          </div>
        </td>
      </tr>
    `).join('');
    emptyMessage.hidden = filtered.length !== 0;
  }

  function resetForm() {
    form.reset();
    document.getElementById('expert-id').value = '';
    Store.renderAnimalCheckboxes(animalOptions);
  }

  function openNewForm() {
    resetForm();
    document.getElementById('form-title').textContent = 'Adicionar especialista';
    showView('form');
    document.getElementById('expert-name').focus();
  }

  function openEditForm(id) {
    const record = records().find(item => item.id === id);
    if (!record) return;
    resetForm();
    document.getElementById('form-title').textContent = 'Editar especialista';
    document.getElementById('expert-id').value = record.id;
    document.getElementById('expert-name').value = record.name || '';
    document.getElementById('expert-email').value = record.email || '';
    document.getElementById('expert-institution').value = record.institution || '';
    document.getElementById('expert-specialty').value = record.specialty || '';
    document.getElementById('expert-taxonomy').value = record.taxonomy || '';
    document.getElementById('expert-photo').value = record.photo || '';
    document.getElementById('expert-biography').value = record.biography || '';
    Store.renderAnimalCheckboxes(animalOptions, record.animalIds || []);
    showView('form');
    document.getElementById('expert-name').focus();
  }

  function addDetailItem(container, label, value, fullWidth = false, isLink = false) {
    const item = document.createElement('div');
    item.className = fullWidth ? 'detail-item full-width' : 'detail-item';
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    const safeUrl = isLink && value ? (() => {
      try {
        const parsed = new URL(value);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
      } catch {
        return '';
      }
    })() : '';

    if (safeUrl) {
      const link = document.createElement('a');
      link.href = safeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = value;
      description.appendChild(link);
    } else {
      description.textContent = value || '—';
    }
    item.append(term, description);
    container.appendChild(item);
  }

  function openDetails(id) {
    const record = records().find(item => item.id === id);
    if (!record) return;
    currentDetailId = id;
    const details = document.getElementById('expert-details');
    details.replaceChildren();
    addDetailItem(details, 'Nome', record.name);
    addDetailItem(details, 'Email', record.email);
    addDetailItem(details, 'Instituição', record.institution);
    addDetailItem(details, 'Especialidade científica', record.specialty);
    addDetailItem(details, 'Espécie ou família', record.taxonomy);
    addDetailItem(details, 'Fotografia (URL)', record.photo, false, true);
    addDetailItem(details, 'Animais relacionados', Store.animalNames(record.animalIds).join(', '));
    addDetailItem(details, 'Biografia', record.biography, true);
    showView('detail');
  }

  document.getElementById('add-expert').addEventListener('click', openNewForm);
  document.getElementById('cancel-expert').addEventListener('click', () => { showView('list'); renderList(); });
  document.getElementById('back-from-details').addEventListener('click', () => { showView('list'); renderList(); });
  document.getElementById('edit-from-details').addEventListener('click', () => openEditForm(currentDetailId));
  searchInput.addEventListener('input', renderList);

  tableBody.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'view') openDetails(id);
    if (action === 'edit') openEditForm(id);
    if (action === 'delete') {
      const record = records().find(item => item.id === id);
      if (!record || !window.confirm(`Pretende remover o especialista "${record.name}"?`)) return;
      const updated = records().filter(item => item.id !== id);
      if (Store.write('experts', updated)) {
        renderList();
        Store.showToast('Especialista removido.');
      } else {
        window.alert('Não foi possível guardar as alterações.');
      }
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const id = document.getElementById('expert-id').value;
    const record = {
      id: id || Store.createId(),
      name: document.getElementById('expert-name').value.trim(),
      email: document.getElementById('expert-email').value.trim(),
      institution: document.getElementById('expert-institution').value.trim(),
      specialty: document.getElementById('expert-specialty').value.trim(),
      taxonomy: document.getElementById('expert-taxonomy').value.trim(),
      photo: document.getElementById('expert-photo').value.trim(),
      biography: document.getElementById('expert-biography').value.trim(),
      animalIds: Store.checkedAnimalIds(animalOptions)
    };

    const current = records();
    const updated = id
      ? current.map(item => item.id === id ? record : item)
      : [...current, record];

    if (Store.write('experts', updated)) {
      showView('list');
      renderList();
      Store.showToast(id ? 'Especialista atualizado.' : 'Especialista adicionado.');
    } else {
      window.alert('Não foi possível guardar os dados neste navegador.');
    }
  });

  Store.renderAnimalCheckboxes(animalOptions);
  renderList();
})();
