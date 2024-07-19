document.addEventListener('DOMContentLoaded', () => {
  const historySections = {
    today: document.getElementById('today-table'),
    week: document.getElementById('week-table'),
    lastWeek: document.getElementById('last-week-table'),
    earlier: document.getElementById('earlier-table')
  };
  const clearHistoryButton = document.getElementById('clear-history');
  const downloadCsvButton = document.getElementById('download-csv');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // Function to add table header
  const addTableHeader = (table) => {
    const header = table.createTHead();
    const row = header.insertRow(0);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    cell1.innerHTML = "<b>Timestamp</b>";
    cell2.innerHTML = "<b>Website</b>";
    cell3.innerHTML = "<b>Fields</b>";
  };

  // Load and display the history
  chrome.storage.local.get({ autofillData: [] }, (result) => {
    const autofillData = result.autofillData;

    for (const section in historySections) {
      addTableHeader(historySections[section]);
    }

    autofillData.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const mainUrl = new URL(entry.url).hostname;

      const row = document.createElement('tr');
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      const cell3 = row.insertCell(2);
      cell1.textContent = entry.timestamp;
      cell2.textContent = mainUrl;
      cell3.textContent = entry.data.map(field => field.name).join(', ');

      if (entryDate >= startOfToday) {
        historySections.today.appendChild(row);
      } else if (entryDate >= startOfWeek) {
        historySections.week.appendChild(row);
      } else if (entryDate >= startOfLastWeek) {
        historySections.lastWeek.appendChild(row);
      } else {
        historySections.earlier.appendChild(row);
      }
    });

    // Show only relevant sections
    if (!historySections.today.rows.length > 1) {
      document.getElementById('today-section').style.display = 'none';
    }
    if (!historySections.week.rows.length > 1) {
      document.getElementById('week-section').style.display = 'none';
    }
    if (!historySections.lastWeek.rows.length > 1) {
      document.getElementById('last-week-section').style.display = 'none';
    }
    if (!historySections.earlier.rows.length > 1) {
      document.getElementById('earlier-section').style.display = 'none';
    }
  });

  // Clear the history
  clearHistoryButton.addEventListener('click', () => {
    chrome.storage.local.set({ autofillData: [] }, () => {
      for (let section in historySections) {
        while (historySections[section].firstChild) {
          historySections[section].removeChild(historySections[section].firstChild);
        }
        addTableHeader(historySections[section]);
      }
    });
  });

  // Download history as CSV
  downloadCsvButton.addEventListener('click', () => {
    chrome.storage.local.get({ autofillData: [] }, (result) => {
      const autofillData = result.autofillData;
      const csvContent = "data:text/csv;charset=utf-8,"
        + "Timestamp,Website,Fields\n"
        + autofillData.map(entry => `${entry.timestamp},${new URL(entry.url).hostname},"${entry.data.map(field => field.name).join(', ')}"`).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'autofill_history.csv');
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
    });
  });
});
