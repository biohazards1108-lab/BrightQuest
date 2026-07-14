import { getAgeGroup } from '../models/ageGroupModel.js';
import { getGamesByGroup } from '../models/gamesModel.js';

export async function fetchGames(req, res) {
  const age = parseInt(req.params.age);

  const group = await getAgeGroup(age);
  if (!group) return res.json([]);

  const games = await getGamesByGroup(group.id);
  res.json(games);
}
