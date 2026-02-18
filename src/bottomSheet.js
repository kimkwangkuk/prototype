import { subjects, CURRENT_VARIANT } from './config.js';

export class BottomSheet {
  constructor(onSave, onCancel, onCategoryChange = null, onTextChange = null, onTimeChange = null, onDurationChange = null) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.onCategoryChange = onCategoryChange;
    this.onTextChange = onTextChange;
    this.onTimeChange = onTimeChange;
    this.onDurationChange = onDurationChange;
    this.selectedCategory = null;
    this.selectedDuration = null;
    this.selectedStatus = 'empty';
    this.startTime = '';
    this.todoText = '';
    this.originalText = '';
    this.originalCategory = null;
    this.originalDuration = null;
    this.originalStartTime = '';
    this.originalStatus = 'empty';
    this.activePopup = null;
    this.currentMode = 'full';

    this.createElements();
    this.attachEventListeners();
  }

  createElements() {
    // Overlay (투명, 딤 처리 없음)
    this.overlay = document.createElement('div');
    this.overlay.className = 'bottom-sheet-overlay';

    // Bottom Sheet
    this.sheet = document.createElement('div');
    this.sheet.className = 'bottom-sheet';
    this.sheet.innerHTML = this.getHTML();

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.sheet);
  }

  getHTML() {
    const variants = {
      a: () => this.getHTML_A(),
      b: () => this.currentMode === 'status-only' ? this.getHTML_A() : this.getHTML_B(),
      c: () => this.getHTML_A(), // C는 임시로 A 사용
    };
    return variants[CURRENT_VARIANT]();
  }

  getHTML_A() {
    return `
      <div class="bottom-sheet-header">
        <h3 class="bottom-sheet-title">상세 설정</h3>
        <button class="btn-close" data-action="close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="bottom-sheet-section">
        <div class="section-label">Status</div>
        <div class="status-list">
          <button class="status-chip" data-status="empty" title="미완료">
            <div class="status-icon">
              <div class="cb-empty"></div>
            </div>
            <span>미완료</span>
          </button>
          <button class="status-chip" data-status="progress" title="진행중">
            <div class="status-icon">
              <div class="cb-progress"><div class="cb-progress-fill" style="background:#5570f7"></div></div>
            </div>
            <span>진행중</span>
          </button>
          <button class="status-chip" data-status="done" title="완료">
            <div class="status-icon">
              <div class="cb-done" style="border-color:#5570f7"></div>
            </div>
            <span>완료</span>
          </button>
          <button class="status-chip" data-status="skip" title="건너뜀">
            <div class="status-icon">
              <div class="cb-skip">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5570f7" stroke-width="1.8">
                  <polygon points="12,4 22,20 2,20"/>
                </svg>
              </div>
            </div>
            <span>건너뜀</span>
          </button>
          <button class="status-chip" data-status="cancel" title="취소">
            <div class="status-icon">
              <div class="cb-cancel">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5570f7" stroke-width="2" stroke-linecap="round">
                  <line x1="5" y1="5" x2="19" y2="19"/>
                  <line x1="19" y1="5" x2="5" y2="19"/>
                </svg>
              </div>
            </div>
            <span>취소</span>
          </button>
        </div>
      </div>

      <div class="bottom-sheet-section">
        <div class="section-label">Category</div>
        <div class="category-list">
          ${subjects.map(s => `
            <button class="category-chip" data-category="${s.id}" style="--chip-color: ${s.color}">
              ${s.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="bottom-sheet-section">
        <div class="section-label">Time & Duration</div>
        <div class="time-duration-row">
          <div class="time-input-group">
            <div class="time-input-label">Start Time</div>
            <div class="time-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <input type="time" class="time-input" data-input="time" placeholder="00:00">
            </div>
          </div>
          <div class="time-input-group">
            <div class="time-input-label">Duration</div>
            <div class="time-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="time-input" data-display="duration">선택</span>
            </div>
          </div>
        </div>
        <div class="duration-buttons" style="margin-top: 10px;">
          <button class="duration-btn" data-duration="30">30m</button>
          <button class="duration-btn" data-duration="60">1h</button>
          <button class="duration-btn" data-duration="120">2h</button>
        </div>
      </div>

      <button class="btn-save" data-action="save">할일 저장</button>
    `;
  }

  getHTML_B() {
    const categoryName = this.selectedCategory ? subjects.find(s => s.id === this.selectedCategory)?.name || '과목' : '과목';
    const timeText = this.startTime || '시작 시간';
    const durationText = this.selectedDuration ? this.formatDuration(this.selectedDuration) : '지속 시간';

    return `
      <div class="bottom-sheet-text-input-wrapper">
        <input type="text" class="bottom-sheet-text-input" data-input="todo-text" placeholder="할 일 입력..." value="">
      </div>

      <div class="bottom-sheet-toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" data-action="open-category">
            <span class="toolbar-btn-text">${categoryName}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-action="open-time">
            <span class="toolbar-btn-text">${timeText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button class="toolbar-btn" data-action="open-duration">
            <span class="toolbar-btn-text">${durationText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
        <button class="toolbar-save-btn" data-action="save">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 13 12 8 7 13"/>
            <line x1="12" y1="8" x2="12" y2="21"/>
            <line x1="5" y1="21" x2="19" y2="21"/>
          </svg>
        </button>
      </div>

      <!-- Context Menu Popups -->
      <div class="context-popup" data-popup="category" style="display: none;">
        <div class="popup-header">
          <h4 class="popup-title">과목 선택</h4>
          <button class="popup-close" data-action="close-popup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="popup-content">
          ${subjects.map(s => `
            <button class="popup-item" data-category="${s.id}">
              <div class="popup-item-color" style="background:${s.color}"></div>
              <span>${s.name}</span>
              <svg class="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="context-popup" data-popup="time" style="display: none;">
        <div class="popup-header">
          <h4 class="popup-title">시작 시간</h4>
          <button class="popup-close" data-action="close-popup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="popup-content">
          <input type="time" class="popup-time-input" data-input="time" value="${this.startTime || ''}">
        </div>
      </div>

      <div class="context-popup" data-popup="duration" style="display: none;">
        <div class="popup-header">
          <h4 class="popup-title">지속 시간</h4>
          <button class="popup-close" data-action="close-popup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="popup-content">
          <button class="popup-item" data-duration="30">
            <span>30분</span>
            <svg class="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="popup-item" data-duration="60">
            <span>1시간</span>
            <svg class="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="popup-item" data-duration="90">
            <span>1시간 30분</span>
            <svg class="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="popup-item" data-duration="120">
            <span>2시간</span>
            <svg class="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }

  attachEventListeners() {
    // B타입이지만 status-only 모드면 A타입 리스너 사용
    if (CURRENT_VARIANT === 'b' && this.currentMode !== 'status-only') {
      this.attachEventListeners_B();
    } else {
      this.attachEventListeners_A();
    }
  }

  attachEventListeners_A() {
    // Remove old event listeners by cloning elements
    const newSheet = this.sheet.cloneNode(true);
    const newOverlay = this.overlay.cloneNode(true);
    this.sheet.parentNode.replaceChild(newSheet, this.sheet);
    this.overlay.parentNode.replaceChild(newOverlay, this.overlay);
    this.sheet = newSheet;
    this.overlay = newOverlay;

    // Close button
    this.sheet.querySelector('[data-action="close"]').addEventListener('click', () => {
      this.hide();
      if (this.onCancel) {
        this.onCancel({
          text: this.originalText,
          category: this.originalCategory,
          duration: this.originalDuration,
          startTime: this.originalStartTime,
          status: this.originalStatus
        });
      }
    });

    // Sheet click - prevent clicks from going through
    this.sheet.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Overlay click (바깥 영역 클릭 시 취소)
    this.overlay.addEventListener('click', () => {
      this.hide();
      if (this.onCancel) {
        this.onCancel({
          text: this.originalText,
          category: this.originalCategory,
          duration: this.originalDuration,
          startTime: this.originalStartTime,
          status: this.originalStatus
        });
      }
    });
    this.overlay.style.pointerEvents = 'auto';

    // Status selection
    this.sheet.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sheet.querySelectorAll('[data-status]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedStatus = btn.dataset.status;
      });
    });

    // Category selection
    this.sheet.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sheet.querySelectorAll('[data-category]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedCategory = btn.dataset.category;

        // 과목 변경 시 즉시 반영 (onCategoryChange 콜백 호출)
        if (this.onCategoryChange) {
          this.onCategoryChange(btn.dataset.category);
        }
      });
    });

    // Duration buttons
    this.sheet.querySelectorAll('[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sheet.querySelectorAll('[data-duration]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDuration = parseInt(btn.dataset.duration);

        // Update display
        const display = this.sheet.querySelector('[data-display="duration"]');
        const minutes = this.selectedDuration;
        if (minutes < 60) {
          display.textContent = `${minutes}분`;
        } else {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          display.textContent = mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
        }
      });
    });

    // Time input
    this.sheet.querySelector('[data-input="time"]').addEventListener('change', (e) => {
      this.startTime = e.target.value;
    });

    // Save button
    this.sheet.querySelector('[data-action="save"]').addEventListener('click', () => {
      const data = {
        status: this.selectedStatus,
        category: this.selectedCategory,
        startTime: this.startTime,
        duration: this.selectedDuration
      };

      this.hide();
      if (this.onSave) this.onSave(data);
    });
  }

  attachEventListeners_B() {
    // Remove old event listeners by cloning elements
    const newSheet = this.sheet.cloneNode(true);
    const newOverlay = this.overlay.cloneNode(true);
    this.sheet.parentNode.replaceChild(newSheet, this.sheet);
    this.overlay.parentNode.replaceChild(newOverlay, this.overlay);
    this.sheet = newSheet;
    this.overlay = newOverlay;

    // Sheet click - prevent clicks from going through
    this.sheet.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Toolbar button clicks - open popups
    this.sheet.querySelector('[data-action="open-category"]')?.addEventListener('click', () => {
      this.openPopup('category');
    });

    this.sheet.querySelector('[data-action="open-time"]')?.addEventListener('click', () => {
      this.openPopup('time');
    });

    this.sheet.querySelector('[data-action="open-duration"]')?.addEventListener('click', () => {
      this.openPopup('duration');
    });

    // Close popup buttons
    this.sheet.querySelectorAll('[data-action="close-popup"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closePopup();
      });
    });

    // Overlay click - close everything
    this.overlay.addEventListener('click', () => {
      if (this.activePopup) {
        this.closePopup();
      } else {
        this.hide();
        if (this.onCancel) {
          this.onCancel({
            text: this.originalText,
            category: this.originalCategory,
            duration: this.originalDuration,
            startTime: this.originalStartTime,
            status: this.originalStatus
          });
        }
      }
    });
    this.overlay.style.pointerEvents = 'auto';

    // Category selection
    this.sheet.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.dataset.category;
        this.updateToolbarButton('category');
        this.closePopup();

        // 저장 버튼 활성화 (텍스트가 있을 때만)
        const saveBtn = this.sheet.querySelector('[data-action="save"]');
        if (saveBtn && this.todoText && this.todoText.trim()) {
          saveBtn.disabled = false;
          saveBtn.classList.remove('disabled');
        }

        // 과목 변경 시 즉시 반영
        if (this.onCategoryChange) {
          this.onCategoryChange(btn.dataset.category);
        }
      });
    });

    // Time input
    const timeInput = this.sheet.querySelector('[data-input="time"]');
    if (timeInput) {
      timeInput.addEventListener('change', (e) => {
        this.startTime = e.target.value;
        this.updateToolbarButton('time');
        this.closePopup();

        // 저장 버튼 활성화 (텍스트가 있을 때만)
        const saveBtn = this.sheet.querySelector('[data-action="save"]');
        if (saveBtn && this.todoText && this.todoText.trim()) {
          saveBtn.disabled = false;
          saveBtn.classList.remove('disabled');
        }

        // 시간 변경 시 즉시 반영
        if (this.onTimeChange) {
          this.onTimeChange(this.startTime);
        }
      });
    }

    // Duration selection
    this.sheet.querySelectorAll('[data-duration]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDuration = parseInt(btn.dataset.duration);
        this.updateToolbarButton('duration');
        this.closePopup();

        // 저장 버튼 활성화 (텍스트가 있을 때만)
        const saveBtn = this.sheet.querySelector('[data-action="save"]');
        if (saveBtn && this.todoText && this.todoText.trim()) {
          saveBtn.disabled = false;
          saveBtn.classList.remove('disabled');
        }

        // 지속 시간 변경 시 즉시 반영
        if (this.onDurationChange) {
          this.onDurationChange(this.selectedDuration);
        }
      });
    });

    // Text input
    const textInput = this.sheet.querySelector('[data-input="todo-text"]');
    if (textInput) {
      const saveBtn = this.sheet.querySelector('[data-action="save"]');

      // 초기 버튼 상태 설정
      if (saveBtn) {
        const isEmpty = !textInput.value.trim();
        saveBtn.disabled = isEmpty;
        if (isEmpty) {
          saveBtn.classList.add('disabled');
        }
      }

      textInput.addEventListener('input', (e) => {
        this.todoText = e.target.value;

        // 버튼 활성화/비활성화 처리
        if (saveBtn) {
          const isEmpty = !this.todoText.trim();
          saveBtn.disabled = isEmpty;
          saveBtn.classList.toggle('disabled', isEmpty);
        }

        // 실시간 텍스트 업데이트 콜백
        if (this.onTextChange) {
          this.onTextChange(this.todoText);
        }
      });
    }

    // Save button
    this.sheet.querySelector('[data-action="save"]')?.addEventListener('click', () => {
      const data = {
        text: this.todoText,
        status: this.selectedStatus,
        category: this.selectedCategory,
        startTime: this.startTime,
        duration: this.selectedDuration
      };

      this.hide();
      if (this.onSave) this.onSave(data);
    });
  }

  openPopup(type) {
    this.activePopup = type;
    this.sheet.querySelectorAll('.context-popup').forEach(p => {
      p.style.display = 'none';
    });
    const popup = this.sheet.querySelector(`[data-popup="${type}"]`);
    if (popup) {
      popup.style.display = 'block';
      this.updatePopupSelection(type);
    }
  }

  closePopup() {
    this.sheet.querySelectorAll('.context-popup').forEach(p => {
      p.style.display = 'none';
    });
    this.activePopup = null;
  }

  updatePopupSelection(type) {
    if (type === 'category') {
      this.sheet.querySelectorAll('[data-category]').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.category === this.selectedCategory);
      });
    } else if (type === 'duration') {
      this.sheet.querySelectorAll('[data-duration]').forEach(btn => {
        const duration = parseInt(btn.dataset.duration);
        btn.classList.toggle('selected', duration === this.selectedDuration);
      });
    }
  }

  updateToolbarButton(type) {
    if (type === 'category') {
      const categoryName = subjects.find(s => s.id === this.selectedCategory)?.name || '과목';
      const btn = this.sheet.querySelector('[data-action="open-category"] .toolbar-btn-text');
      if (btn) btn.textContent = categoryName;
    } else if (type === 'time') {
      const timeText = this.startTime || '시작 시간';
      const btn = this.sheet.querySelector('[data-action="open-time"] .toolbar-btn-text');
      if (btn) btn.textContent = timeText;
    } else if (type === 'duration') {
      const durationText = this.selectedDuration ? this.formatDuration(this.selectedDuration) : '지속 시간';
      const btn = this.sheet.querySelector('[data-action="open-duration"] .toolbar-btn-text');
      if (btn) btn.textContent = durationText;
    }
  }

  show(defaultCategory = null, existingData = null, mode = 'full') {
    // Set data
    this.selectedStatus = existingData?.status || 'empty';
    this.selectedCategory = existingData?.category || defaultCategory;
    this.selectedDuration = existingData?.duration || null;
    this.startTime = existingData?.startTime || '';
    this.todoText = existingData?.text || '';

    // 원본 데이터 저장 (취소 시 복원용)
    this.originalText = existingData?.text || '';
    this.originalCategory = existingData?.category || defaultCategory;
    this.originalDuration = existingData?.duration || null;
    this.originalStartTime = existingData?.startTime || '';
    this.originalStatus = existingData?.status || 'empty';

    // mode가 변경되면 HTML을 다시 생성해야 함 (B타입에서 status-only는 A타입 사용)
    if (this.currentMode !== mode && CURRENT_VARIANT === 'b') {
      this.currentMode = mode;
      this.sheet.innerHTML = this.getHTML();
      this.attachEventListeners();
    } else {
      this.currentMode = mode;
    }

    // 활성화된 입력 필드에서 포커스 제거 (status-only 모드에서는 제외)
    if (mode !== 'status-only') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        activeElement.blur();
      }
    }

    if (CURRENT_VARIANT === 'b' && mode !== 'status-only') {
      // B 타입은 mode 무시하고 항상 같은 형태
      this.updateToolbarButton('category');
      this.updateToolbarButton('time');
      this.updateToolbarButton('duration');

      // Set text input value
      const textInput = this.sheet.querySelector('[data-input="todo-text"]');
      if (textInput) {
        textInput.value = this.todoText;
        // Focus on text input
        setTimeout(() => {
          textInput.focus();
        }, 100);
      }
    } else {
      // A 타입은 기존 mode 로직 유지
      if (mode === 'status-only') {
        this.sheet.classList.add('status-only-mode');
        this.sheet.classList.remove('hide-status');
        this.sheet.querySelector('.bottom-sheet-title').textContent = '상태 변경';
      } else if (mode === 'edit') {
        this.sheet.classList.remove('status-only-mode');
        this.sheet.classList.remove('hide-status');
        this.sheet.querySelector('.bottom-sheet-title').textContent = '할일 수정';
      } else {
        this.sheet.classList.remove('status-only-mode');
        this.sheet.classList.add('hide-status');
        this.sheet.querySelector('.bottom-sheet-title').textContent = '상세 설정';
      }

      // Update status buttons
      this.sheet.querySelectorAll('[data-status]').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.status === this.selectedStatus);
      });

      // Update category buttons
      this.sheet.querySelectorAll('[data-category]').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.category === this.selectedCategory);
      });

      // Update time input
      const timeInput = this.sheet.querySelector('[data-input="time"]');
      if (timeInput) {
        if (existingData?.startTime) {
          timeInput.value = existingData.startTime;
        } else {
          timeInput.value = '';
        }
      }

      // Update duration buttons
      this.sheet.querySelectorAll('[data-duration]').forEach(btn => {
        const duration = parseInt(btn.dataset.duration);
        btn.classList.toggle('selected', duration === this.selectedDuration);
      });

      // Update duration display
      const durationDisplay = this.sheet.querySelector('[data-display="duration"]');
      if (durationDisplay) {
        if (this.selectedDuration) {
          const minutes = this.selectedDuration;
          if (minutes < 60) {
            durationDisplay.textContent = `${minutes}분`;
          } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            durationDisplay.textContent = mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
          }
        } else {
          durationDisplay.textContent = '선택';
        }
      }
    }

    // Show with animation
    setTimeout(() => {
      this.sheet.classList.add('visible');
    }, 10);
  }

  hide() {
    this.closePopup();
    this.sheet.classList.remove('visible');
    this.overlay.style.pointerEvents = 'none';
  }

  updateCallbacks(onSave, onCancel, onCategoryChange = null, onTextChange = null, onTimeChange = null, onDurationChange = null) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.onCategoryChange = onCategoryChange;
    this.onTextChange = onTextChange;
    this.onTimeChange = onTimeChange;
    this.onDurationChange = onDurationChange;
  }

  destroy() {
    this.overlay.remove();
    this.sheet.remove();
  }
}
