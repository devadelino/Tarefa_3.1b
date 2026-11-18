/* Funcionalidades da entidade Sponsors. */
(function () {
  'use strict';

  const Store = window.AnimalecStorage;
  const listView = document.getElementById('list-view');
  const formView = document.getElementById('form-view');
  const detailView = document.getElementById('detail-view');
  const form = document.getElementById('sponsor-form');
  const tableBody = document.getElementById('sponsors-table-body');
  const emptyMessage = document.getElementById('sponsors-empty');
  const searchInput = document.getElementById('sponsor-search');
  const animalOptions = document.getElementById('sponsor-animals');
  let currentDetailId = null;

  function records() { return Store.read('sponsors'); }

  function showView(view) {
    listView.hidden = view !== 'list';
    formView.hidden = view !== 'form';
    detailView.hidden = view !== 'detail';
  }

  function renderList() {
    const query = searchInput.value.trim().toLocaleLowerCase('pt-PT');
    const filtered = records().filter(record =>
      [record.name, record.email, record.website, record.description, ...Store.animalNames(record.animalIds)]
        .join(' ').toLocaleLowerCase('pt-PT').includes(query)
    );

    tableBody.innerHTML = filtered.map(record => `
      <tr>
        <td>${Store.escapeHTML(record.name)}</td>
        <td>${Store.escapeHTML(record.email || '—')}</td>
        <td>${Store.escapeHTML(Store.animalNames(record.animalIds).join(', ') || '—')}</td>
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
    document.getElementById('sponsor-id').value = '';
    Store.renderAnimalCheckboxes(animalOptions);
  }

  function openNewForm() {
    resetForm();
    document.getElementById('form-title').textContent = 'Adicionar patrocinador';
    showView('form');
    document.getElementById('sponsor-name').focus();
  }

  function openEditForm(id) {
    const record = records().find(item => item.id === id);
    if (!record) return;
    resetForm();
    document.getElementById('form-title').textContent = 'Editar patrocinador';
    document.getElementById('sponsor-id').value = record.id;
    document.getElementById('sponsor-name').value = record.name || '';
    document.getElementById('sponsor-email').value = record.email || '';
    document.getElementById('sponsor-website').value = record.website || '';
    document.getElementById('sponsor-logo').value = record.logo || '';
    document.getElementById('sponsor-description').value = record.description || '';
    Store.renderAnimalCheckboxes(animalOptions, record.animalIds || []);
    showView('form');
    document.getElementById('sponsor-name').focus();
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
    const details = document.getElementById('sponsor-details');
    details.replaceChildren();
    addDetailItem(details, 'Nome', record.name);
    addDetailItem(details, 'Email', record.email);
    addDetailItem(details, 'Website', record.website, false, true);
    addDetailItem(details, 'Logótipo (URL)', record.logo, false, true);
    addDetailItem(details, 'Animais associados', Store.animalNames(record.animalIds).join(', '));
    addDetailItem(details, 'Descrição', record.description, true);
    showView('detail');
  }

  document.getElementById('add-sponsor').addEventListener('click', openNewForm);
  document.getElementById('cancel-sponsor').addEventListener('click', () => { showView('list'); renderList(); });
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
      if (!record || !window.confirm(`Pretende remover o patrocinador "${record.name}"?`)) return;
      const updated = records().filter(item => item.id !== id);
      if (Store.write('sponsors', updated)) {
        renderList();
        Store.showToast('Patrocinador removido.');
      } else {
        window.alert('Não foi possível guardar as alterações.');
      }
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const id = document.getElementById('sponsor-id').value;
    const record = {
      id: id || Store.createId(),
      name: document.getElementById('sponsor-name').value.trim(),
      email: document.getElementById('sponsor-email').value.trim(),
      website: document.getElementById('sponsor-website').value.trim(),
      logo: document.getElementById('sponsor-logo').value.trim(),
      description: document.getElementById('sponsor-description').value.trim(),
      animalIds: Store.checkedAnimalIds(animalOptions)
    };

    const current = records();
    const updated = id
      ? current.map(item => item.id === id ? record : item)
      : [...current, record];

    if (Store.write('sponsors', updated)) {
      showView('list');
      renderList();
      Store.showToast(id ? 'Patrocinador atualizado.' : 'Patrocinador adicionado.');
    } else {
      window.alert('Não foi possível guardar os dados neste navegador.');
    }
  });

  Store.renderAnimalCheckboxes(animalOptions);
  renderList();
})();
