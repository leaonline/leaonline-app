import { MapIcons } from './MapIcons'
import { Anchor } from './icons/Anchor'
import { Cogwheels } from './icons/Cogwheels'
import { Building } from './icons/Building'
import { Wrench } from './icons/Wrench'
import { Astronaut } from './icons/Astronaut'
import { Truck } from './icons/Truck'

export const loadMapIcons = () => {
  if (MapIcons.size() > 0) {
    return false
  }
  MapIcons.register(Anchor)
  MapIcons.register(Cogwheels)
  MapIcons.register(Building)
  MapIcons.register(Wrench)
  MapIcons.register(Astronaut)
  MapIcons.register(Truck)
  return true
}
