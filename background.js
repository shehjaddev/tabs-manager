chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-pin") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.update(tab.id, { pinned: !tab.pinned });
    }
  }

  if (command === "toggle-pin-all") {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Only consider ungrouped tabs
    const ungroupedTabs = tabs.filter(tab => tab.groupId === -1);
    const hasUnpinned = ungroupedTabs.some(tab => !tab.pinned);

    for (const tab of ungroupedTabs) {
      chrome.tabs.update(tab.id, { pinned: hasUnpinned });
    }
  }

  if (command === "group-unpinned") {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 🧹 If active tab is in a group → ungroup the group
    if (activeTab && activeTab.groupId !== -1) {
      const groupedTabs = await chrome.tabs.query({ groupId: activeTab.groupId });
      const tabIds = groupedTabs.map(t => t.id);
      await chrome.tabs.ungroup(tabIds);
      return;
    }

    // Otherwise, group all unpinned & ungrouped tabs
    const ungroupedUnpinnedTabs = await chrome.tabs.query({
      currentWindow: true,
      pinned: false
    });

    const filtered = ungroupedUnpinnedTabs.filter(tab => tab.groupId === -1);

    if (filtered.length > 0) {
      const tabIds = filtered.map(t => t.id);
      await chrome.tabs.group({ tabIds });
    }
  }
});
