document.addEventListener('DOMContentLoaded', () => {
    const habits = document.querySelectorAll('.habit-checkbox');
    const historyContent = document.querySelector('.history-content');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const registerButton = document.getElementById('register-button');
    const backButton = document.getElementById('back-button');
    let currentPage = 1;
    const habitsPerPage = 5;
    let selectedDate = null;
    let selectedHabits = [];
    let habitsHistory = {};
  
    function updateSelectedHabits() {
      selectedHabits = Array.from(document.querySelectorAll('.habit-checkbox:checked')).map(habit => habit.value);
    }
  
    function formatDate(date) {
      const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
      return new Date(date).toLocaleDateString('pt-BR', options);
    }
  
    function resetTitle() {
      document.getElementById('history-title').textContent = 'Histórico:';
    }
  
    function updateHistory() {
      historyContent.innerHTML = '';
  
      if (selectedDate) {
        backButton.style.display = 'block';
        showHabitsForDate(selectedDate);
        hidePageButtons();
      } else {
        backButton.style.display = 'none';
  
        const dates = Object.keys(habitsHistory).sort((a, b) => new Date(b) - new Date(a));
        const startIndex = (currentPage - 1) * habitsPerPage;
        const endIndex = startIndex + habitsPerPage;
  
        if (dates.length === 0) {
          const noRecords = document.createElement('p');
          noRecords.textContent = 'Você ainda não fez nenhum registro :(';
          historyContent.appendChild(noRecords);
          hidePageButtons();
        } else {
          for (let i = startIndex; i < endIndex && i < dates.length; i++) {
            const dateEntry = document.createElement('div');
            dateEntry.className = 'history-entry';
            dateEntry.textContent = formatDate(dates[i]);
  
            dateEntry.addEventListener('click', () => {
              selectedDate = dates[i];
              updateHistory();
            });
  
            historyContent.appendChild(dateEntry);
          }
  
          prevPageButton.disabled = currentPage === 1;
          nextPageButton.disabled = endIndex >= dates.length;
          showPageButtons();
        }
      }
    }
  
    function showHabitsForDate(date) {
      historyContent.innerHTML = '';
  
      const habitsForDate = habitsHistory[date];
      if (habitsForDate.length === 0) {
        const noRecords = document.createElement('p');
        noRecords.textContent = 'Sem registros';
        historyContent.appendChild(noRecords);
      } else {
        document.getElementById('history-title').textContent = `Neste dia você...`;
  
        habitsForDate.forEach((entry, index) => {
          const entryDiv = document.createElement('div');
          entryDiv.className = 'history-entry';
  
          const habitInfo = document.createElement('span');
          habitInfo.textContent = `${entry.habit}`;
  
          const removeButton = document.createElement('button');
          removeButton.textContent = '✖';
          removeButton.className = 'remove-button';
          removeButton.setAttribute('data-index', index);
          removeButton.addEventListener('click', () => removeHabit(date, index));
  
          entryDiv.appendChild(habitInfo);
          entryDiv.appendChild(removeButton);
  
          historyContent.appendChild(entryDiv);
        });
      }
    }
  
    function removeHabit(date, index) {
      habitsHistory[date].splice(index, 1);
  
      if (habitsHistory[date].length === 0) {
        delete habitsHistory[date];
        resetTitle();
        selectedDate = null;
      }
  
      updateHistory();
      updatePageNavigation();
      localStorage.setItem('habitsHistory', JSON.stringify(habitsHistory));
    }
  
    function hidePageButtons() {
      prevPageButton.style.display = 'none';
      nextPageButton.style.display = 'none';
    }
  
    function showPageButtons() {
      prevPageButton.style.display = 'block';
      nextPageButton.style.display = 'block';
    }
  
    prevPageButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateHistory();
      }
    });
  
    nextPageButton.addEventListener('click', () => {
      const dates = Object.keys(habitsHistory).sort((a, b) => new Date(b) - new Date(a));
      const maxPage = Math.ceil(dates.length / habitsPerPage);
      if (currentPage < maxPage) {
        currentPage++;
        updateHistory();
      }
    });
  
    // Load habitsHistory from local storage
    const storedHabitsHistory = localStorage.getItem('habitsHistory');
    if (storedHabitsHistory) {
      habitsHistory = JSON.parse(storedHabitsHistory);
      updateHistory();
    }
  
    habits.forEach(habit => {
      habit.addEventListener('change', () => {
        updateSelectedHabits();
      });
    });
  
    registerButton.addEventListener('click', () => {
      updateSelectedHabits();
      if (selectedHabits.length > 0) {
        const currentDate = new Date().toISOString().slice(0, 10);
  
        if (!habitsHistory[currentDate]) {
          habitsHistory[currentDate] = [];
        }
  
        selectedHabits.forEach(habit => {
          habitsHistory[currentDate].push({
            habit: habit,
            time: new Date().toLocaleTimeString()
          });
        });
  
        updateHistory();
        localStorage.setItem('habitsHistory', JSON.stringify(habitsHistory));
      }
    });
  
    backButton.addEventListener('click', () => {
      selectedDate = null;
      resetTitle();
      updateHistory();
      updatePageNavigation();
    });
  
    updateHistory();
  });
  