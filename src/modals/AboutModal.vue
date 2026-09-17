<script setup>
defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const close = () => emit('close')
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>About 5e Encounter Builder</h2>
        <button class="close-btn" aria-label="Close" @click="close">&times;</button>
      </div>

      <div class="about-body">
        <section>
          <h3>What is this?</h3>
          <p>
            A lightweight combat and encounter tracker for Dungeons &amp; Dragons 5e. Search a
            library of monsters, bookmark the ones you like, and run an initiative order for your
            table. Creature data comes from the
            <a href="https://open5e.com/" target="_blank" rel="noopener noreferrer"
              >Open5e API v2</a
            >
            and no account or backend is needed &mdash; everything you create is stored locally in
            your browser.
          </p>
        </section>

        <section>
          <h3>Searching monsters</h3>
          <ul>
            <li>Open <strong>Search Monsters</strong> in the header.</li>
            <li>
              Type a name and press Enter (or click Search). Use <strong>Filters</strong> to narrow
              the results by challenge rating range, creature type, and source book.
            </li>
            <li>Click a column heading (Name, Type, CR, HP, AC) to sort the list.</li>
            <li>
              Click a row to add that monster to <strong>both</strong> favorites and the combat
              list.
            </li>
            <li>Click the ☆ button to add it to favorites only.</li>
          </ul>
        </section>

        <section>
          <h3>Homebrew &amp; favorites</h3>
          <ul>
            <li>
              Click <strong>+ Add Monster</strong> to create a custom monster (stats, abilities and
              description). Homebrew monsters are saved as favorites and tagged as custom.
            </li>
            <li>Open <strong>Favorites</strong> to see your bookmarked and homebrew monsters.</li>
            <li>Click a favorite to add it to the combat list.</li>
            <li>Click ℹ️ to view the full creature details.</li>
            <li>Click ✕ to remove it from favorites (this does not affect the combat list).</li>
          </ul>
        </section>

        <section>
          <h3>Running combat</h3>
          <ul>
            <li>
              Add monsters from the search or favorites list, then use
              <strong>Roll Initiative</strong> to roll for everyone (or click the d20 next to a
              single monster) and <strong>Sort</strong> to order the list.
            </li>
            <li>
              <strong>Start Combat</strong> begins the fight at the highest initiative; the header
              shows the <strong>round</strong> and the active monster is highlighted.
            </li>
            <li>
              <strong>Next</strong> / <strong>Previous</strong> move through the turn order.
              Wrapping past the last (or before the first) monster advances or rewinds the round.
            </li>
            <li>
              Click a monster to toggle a "done" strike-through, and type a number in the
              <strong>Damage</strong> box then Apply (or press Enter) to reduce its HP.
            </li>
            <li>
              Remove a monster with <strong>right-click</strong>, or on touch devices by
              <strong>swiping right</strong>.
            </li>
            <li>
              <strong>Reset combat</strong> clears initiative and "done" flags and restores
              everyone's starting HP.
            </li>
          </ul>
        </section>

        <section>
          <h3>Saving, export &amp; import</h3>
          <ul>
            <li>
              Your favorites, combat list, and the current round/turn are saved automatically in
              this browser, so an in-progress fight survives a page refresh.
            </li>
            <li>
              <strong>Export State</strong> downloads a single JSON save file containing your
              favorites (including homebrew), the combat list, and the current round/turn.
            </li>
            <li>
              <strong>Import State</strong> reads such a file and lets you choose how to apply it:
              <ul>
                <li>
                  <strong>Merge favorites only</strong> &mdash; add new favorites and keep your
                  current fight untouched.
                </li>
                <li>
                  <strong>Merge favorites, replace the rest</strong> &mdash; keep your library but
                  load the file's combat list and round.
                </li>
                <li>
                  <strong>Replace everything</strong> &mdash; discard the current state and use the
                  file.
                </li>
              </ul>
            </li>
            <li>
              Save files carry a version number, so older exports keep working after the format
              changes.
            </li>
          </ul>
        </section>

        <section>
          <h3>Privacy</h3>
          <p>
            There is no server and no account. Nothing is uploaded: your data lives only in this
            browser's local storage and in the save files you export yourself.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #444;
  position: sticky;
  top: 0;
  background: #2a2a2a;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.about-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-body section h3 {
  margin: 0 0 0.5rem;
  color: #ffd700;
  font-size: 1.1rem;
}

.about-body p {
  margin: 0;
  color: #ccc;
  line-height: 1.6;
}

.about-body ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #ccc;
  line-height: 1.6;
}

.about-body li {
  margin-bottom: 0.4rem;
}

.about-body li:last-child {
  margin-bottom: 0;
}

.about-body ul ul {
  margin-top: 0.4rem;
}

.about-body strong {
  color: #fff;
}

.about-body a {
  color: #4caf50;
  text-decoration: none;
}

.about-body a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .modal-header h2 {
    font-size: 1.2rem;
  }

  .about-body {
    padding: 1rem;
    gap: 1.25rem;
  }
}
</style>
