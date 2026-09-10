// Feature: Pokédex.
// Lógica e renderização do Pokédex. Dados das gerações permanecem no index nesta etapa.

function buildPokedexModal() {
  if (state.pokedexModal !== null) {
    const pk = POKEDEX_151.find(p=>p.no===state.pokedexModal);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, state.pokedex151[pk.no]||null, 'linkPokedexSlot', 'unlinkPokedexSlot', 'Gen I');
  }
  if (state.pokedexModalG2 !== null && state.pokedexModalG2 !== undefined) {
    const pk = POKEDEX_JOHTO.find(p=>p.no===state.pokedexModalG2);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexJohto||{})[pk.no]||null, 'linkPokedexSlotG2', 'unlinkPokedexSlotG2', 'Gen II');
  }
  if (state.pokedexModalG3 !== null && state.pokedexModalG3 !== undefined) {
    const pk = POKEDEX_HOENN.find(p=>p.no===state.pokedexModalG3);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexHoenn||{})[pk.no]||null, 'linkPokedexSlotG3', 'unlinkPokedexSlotG3', 'Gen III');
  }
  if (state.pokedexModalG4 !== null && state.pokedexModalG4 !== undefined) {
    const pk = POKEDEX_SINNOH.find(p=>p.no===state.pokedexModalG4);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexSinnoh||{})[pk.no]||null, 'linkPokedexSlotG4', 'unlinkPokedexSlotG4', 'Gen IV');
  }
  if (state.pokedexModalG5 !== null && state.pokedexModalG5 !== undefined) {
    const pk = POKEDEX_UNOVA.find(p=>p.no===state.pokedexModalG5);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexUnova||{})[pk.no]||null, 'linkPokedexSlotG5', 'unlinkPokedexSlotG5', 'Gen V');
  }
  if (state.pokedexModalG6 !== null && state.pokedexModalG6 !== undefined) {
    const pk = POKEDEX_KALOS.find(p=>p.no===state.pokedexModalG6);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexKalos||{})[pk.no]||null, 'linkPokedexSlotG6', 'unlinkPokedexSlotG6', 'Gen VI');
  }
  if (state.pokedexModalG7 !== null && state.pokedexModalG7 !== undefined) {
    const pk = POKEDEX_ALOLA.find(p=>p.no===state.pokedexModalG7);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexAlola||{})[pk.no]||null, 'linkPokedexSlotG7', 'unlinkPokedexSlotG7', 'Gen VII');
  }
  if (state.pokedexModalG8 !== null && state.pokedexModalG8 !== undefined) {
    const pk = POKEDEX_GALAR.find(p=>p.no===state.pokedexModalG8);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexGalar||{})[pk.no]||null, 'linkPokedexSlotG8', 'unlinkPokedexSlotG8', 'Gen VIII');
  }
  if (state.pokedexModalG9 !== null && state.pokedexModalG9 !== undefined) {
    const pk = POKEDEX_PALDEA.find(p=>p.no===state.pokedexModalG9);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexPaldea||{})[pk.no]||null, 'linkPokedexSlotG9', 'unlinkPokedexSlotG9', 'Gen IX');
  }
  return '';
}
