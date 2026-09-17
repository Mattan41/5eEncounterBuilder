<script setup>
import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const close = () => emit('close')
</script>

<template>
  <BaseModal :show="show" title="About 5e Encounter Builder" @close="close">
    <div class="about-body">
      <section>
        <h3>What is this?</h3>
        <p>
          A lightweight combat and encounter tracker for the TTRPG 5e system. Search a library
          of monsters, bookmark the ones you like, and run an initiative order for your table.
          Creature data comes from the
          <a href="https://open5e.com/" target="_blank" rel="noopener noreferrer">Open5e API</a>
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
            Click a row to add that monster to the <strong>combat list</strong>. Adding the same
            monster twice is allowed, so three goblins are three separate entries.
          </li>
          <li>
            Click the ☆ button to bookmark a monster as a <strong>favorite</strong>; the star turns
            solid, and clicking it again removes the bookmark.
          </li>
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
            <strong>Roll Initiative</strong> to roll for everyone (or click the d20 next to a single
            monster) and <strong>Sort</strong> to order the list.
          </li>
          <li>
            <strong>Start Combat</strong> begins the fight at the highest initiative; the header
            shows the <strong>round</strong> and the active monster is highlighted.
          </li>
          <li>
            <strong>Next</strong> / <strong>Previous</strong> move through the turn order. Wrapping
            past the last (or before the first) monster advances or rewinds the round.
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
            <strong>Reset combat</strong> clears initiative and "done" flags and restores everyone's
            starting HP.
          </li>
        </ul>
      </section>

      <section>
        <h3>Saving, export &amp; import</h3>
        <ul>
          <li>
            Your favorites, combat list, and the current round/turn are saved automatically in this
            browser, so an in-progress fight survives a page refresh.
          </li>
          <li>
            The layout is remembered too: whichever panels you had open (Search, Favorites, Combat)
            come back the same way after a refresh. Layout is a local preference, so it is not part
            of an exported save file.
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
  </BaseModal>
</template>

<style scoped>
/* The modal shell (backdrop, header, close button) is shared via BaseModal
   and components.css - only the About content styling lives here. */
.about-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-body section h3 {
  margin: 0 0 0.5rem;
  color: var(--gold);
  font-size: 1.1rem;
}

.about-body p {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.6;
}

.about-body ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-soft);
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
  color: var(--text-strong);
}

.about-body a {
  color: var(--success);
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
