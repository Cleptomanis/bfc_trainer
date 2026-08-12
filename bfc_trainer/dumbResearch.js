//#region BEGIN

function dumb25aMissileResearch(id="")
{
    // Rocket trainer exception: Scourge itself may be researched only as
    // late filler. Every other missile / SAM research stays blocked.
    if (dumbSchema==SCHEMA_ROCKET && id=="R-Wpn-Missile2A-T") return false
    return id.includes("Missile") || id.toLowerCase().includes("sam") || id.includes("ATMiss")
}
function dumb25aRocketThermalResearch(id="")
{
    return dumbSchema==SCHEMA_ROCKET && (
        id.startsWith("R-Vehicle-Armor-Heat") ||
        id.startsWith("R-Cyborg-Armor-Heat")
    )
}
function dumb25aRocketUnusedBodyResearch(id="")
{
    if (dumbSchema!=SCHEMA_ROCKET || !id.startsWith("R-Vehicle-Body")) return false
    return id!="R-Vehicle-Body01" && id!="R-Vehicle-Body02"
}
function dumb25aRocketDeadWeaponResearch(id="")
{
    if (dumbSchema!=SCHEMA_ROCKET) return false
    // Production never uses Bunker Buster; do not spend a lab on it.
    return id=="R-Wpn-Rocket03-HvAT"
}
function dumb25aRocketForbiddenPropulsionResearch(id="")
{
    // Hover is never part of bfc_trainer's doctrine.
    return dumbSchema==SCHEMA_ROCKET && id=="R-Vehicle-Prop-Hover"
}
function goodResearch(id="")
{
    var cost=getResearch(id,me).power
    var power=playerPower(me)-queuedPower(me)-enumStruct(me,FACTORY).filter(i=>structureIdle(i)).length*400
    
    const HIGH=-10000
    const NORMAL=0
    const LOW=10000
    
    function toward(researchName)
    {
        return findResearch(researchName).map(i=>i.id).includes(id)
    }
    function reached(researchName,player=me)
    {
        var res=getResearch(researchName,player)
        return res.started || res.done 
    }
    function done(researchName,player=me)
    {
        return getResearch(researchName,player).done 
    }
    function prefix(researchName)
    {
        return id.startsWith(researchName) 
    }

    // Tracks doctrine: only research Tracks as a response to an enemy that has
    // actually invested in Mortar upgrades, and only while that enemy has fewer
    // than 25 ground Mortar droids. This deliberately replaces dumb25a's stale
    // Body10-based Tracks gate; bfc_trainer is Viper -> Leopard only.
    function enemyHasMortarUpgradeDone()
    {
        var mortarUpgrades=[
            "R-Wpn-Mortar-Damage01", "R-Wpn-Mortar-Damage02", "R-Wpn-Mortar-Damage03",
            "R-Wpn-Mortar-Damage04", "R-Wpn-Mortar-Damage05", "R-Wpn-Mortar-Damage06",
            "R-Wpn-Mortar-Acc01", "R-Wpn-Mortar-Acc02", "R-Wpn-Mortar-Acc03",
            "R-Wpn-Mortar-ROF01", "R-Wpn-Mortar-ROF02", "R-Wpn-Mortar-ROF03"
        ]
        return mortarUpgrades.some(r=>{
            var res=getResearch(r,enemy)
            return res && res.done
        })
    }
    function enemyMortarDroidCount()
    {
        return enumDroid(enemy,DROID_WEAPON).filter(d=>{
            if (d.propulsion=="CyborgLegs" || isVTOL(d) || !d.weapons || d.weapons.length==0)return false
            var stat=objectWeaponStat(d)
            return stat && stat.ImpactClass=="MORTARS"
        }).length
    }

    if (getResearch(id,me).started)return Infinity

    if (prefix("R-Vehicle-Prop-Tracks"))
    {
        // Hard gate: no enemy Mortar upgrades, or 25+ enemy Mortar droids = no Tracks research.
        if (!enemyHasMortarUpgradeDone() || enemyMortarDroidCount()>=25)return Infinity
        // When the condition is met, Tracks becomes a meaningful counter-tech, but
        // it still stays below Labs / Rocket Damage / Repair Facility / critical Rocket work.
        return HIGH-1000
    }

    if (dumb25aMissileResearch(id) || dumb25aRocketThermalResearch(id) ||
        dumb25aRocketUnusedBodyResearch(id) || dumb25aRocketDeadWeaponResearch(id) ||
        dumb25aRocketForbiddenPropulsionResearch(id)) return Infinity

    // Mortar research is allowed only as a last-resort cleanup branch.
    if (id.toLowerCase().includes("mortar")) return LOW+1000000+cost

    // bfc_trainer Rocket doctrine. Scores are intentionally explicit so the
    // multi-lab scheduler naturally keeps the important research lanes occupied.
    if (dumbSchema==SCHEMA_ROCKET)
    {
        // 1) Permanent lanes: Labs and Rocket Damage are never sacrificed.
        if (toward("R-Struc-Research-Upgrade09")) return HIGH-5000
        if (!done("R-Wpn-Rocket-Damage09") && toward("R-Wpn-Rocket-Damage09")) return HIGH-4990

        // 2) Take the core Rocket combat unlocks immediately when the final
        // topic is available. These remain superior to armor.
        if (id=="R-Wpn-Rocket02-MRL") return HIGH-4985
        if (id=="R-Wpn-Rocket07-Tank-Killer") return HIGH-4984
        if (id=="R-Wpn-Rocket02-MRLHvy") return HIGH-4983
        if (id=="R-Cyborg-Hvywpn-TK") return HIGH-4982

        // 3) Robotic Manufacturing (R-Struc-Factory-Upgrade04, the finished
        // upgrade — not R-Struc-Factory-Upgrade01/Automated Manufacturing
        // below, which is its prerequisite and keeps its own score) now
        // outranks both kinetic armor lanes directly under it. Matched by
        // exact id, not toward(), so it can never swallow Upgrade01's line.
        if (!done("R-Struc-Factory-Upgrade04") && id=="R-Struc-Factory-Upgrade04") return HIGH-4972

        // Opening research lanes: Cyborg kinetic armor through Mk4, the
        // first production upgrade, and tank kinetic armor through Mk3.
        if (!done("R-Cyborg-Metals04") && toward("R-Cyborg-Metals04")) return HIGH-4970
        if (!done("R-Struc-Factory-Upgrade01") && toward("R-Struc-Factory-Upgrade01")) return HIGH-4960
        if (!done("R-Vehicle-Metals03") && toward("R-Vehicle-Metals03")) return HIGH-4950

        // Keep progressing toward TK/HRA/TK-borg once the opening lanes have
        // claimed their lab slots. Their unique prerequisite work remains ASAP.
        if (!done("R-Wpn-Rocket02-MRL") && toward("R-Wpn-Rocket02-MRL")) return HIGH-4948
        if (!done("R-Wpn-Rocket07-Tank-Killer") && toward("R-Wpn-Rocket07-Tank-Killer")) return HIGH-4947
        if (!done("R-Wpn-Rocket02-MRLHvy") && toward("R-Wpn-Rocket02-MRLHvy")) return HIGH-4946
        if (!done("R-Cyborg-Hvywpn-TK") && toward("R-Cyborg-Hvywpn-TK")) return HIGH-4945

        // 4) After the opening armor thresholds, reload speed and Leopard
        // follow, then generator upgrades.
        if (!done("R-Wpn-Rocket-ROF03") && toward("R-Wpn-Rocket-ROF03")) return HIGH-4900
        // Viper -> Leopard doctrine remains intact; no later combat body is used.
        if (!done("R-Vehicle-Body02") && toward("R-Vehicle-Body02")) return HIGH-4935
        if (reached("R-Cyborg-Metals04") && reached("R-Vehicle-Metals03") &&
            !done("R-Struc-Power-Upgrade01b") && toward("R-Struc-Power-Upgrade01b")) return HIGH-4700

        // 5) Finish the remaining true Rocket upgrades before Generator Mk3.
        if (!done("R-Wpn-Rocket-Accuracy02") && toward("R-Wpn-Rocket-Accuracy02")) return HIGH-4600
        if (!done("R-Wpn-RocketSlow-Accuracy02") && toward("R-Wpn-RocketSlow-Accuracy02")) return HIGH-4590

        // Gas Turbine Generator Mk3 is protected above later armor and all filler.
        if (!done("R-Struc-Power-Upgrade01c") && toward("R-Struc-Power-Upgrade01c")) return HIGH-4500

        // Previous sensor rule: Sensor Upgrade 1 beats Tank Alloy 4+.
        if (!done("R-Sys-Sensor-Upgrade01") && prefix("R-Sys-Sensor-Upgrade01")) return HIGH-4450

        // At zero stored power, any later generator path still beats armor.
        if (playerPower(me)<=0 && toward("R-Struc-Power-Upgrade03a")) return HIGH-4425

        // 6) Remaining kinetic armor. Thermal armor is hard-blocked separately.
        if (toward("R-Vehicle-Metals09")) return HIGH-4400
        if (toward("R-Cyborg-Metals09")) return HIGH-4390

        // Repair is still useful, but it no longer steals one of the new opening
        // permanent lanes defined above. It remains above filler/cleanup research.
        if (toward("R-Struc-RepairFacility")) return HIGH-4975

        // Do not let later production / generator branches silently jump above
        // the doctrine after Robotic Manufacturing / Gas Turbine Mk3.
        if (done("R-Struc-Factory-Upgrade04") && toward("R-Struc-Factory-Upgrade09")) return LOW+2500+cost
        if (done("R-Struc-Power-Upgrade01c") && toward("R-Struc-Power-Upgrade03a"))
            return playerPower(me)<=0 ? HIGH-4425 : LOW+2600+cost

        // Walls must never beat kinetic armor.
        if (id.toLowerCase().includes("wall")) return LOW+3000+cost

        // Engines are side research for this doctrine. Hover is hard-blocked.
        if (prefix("R-Vehicle-Engine")) return LOW+5000+cost

        // Laser and Scourge are explicitly allowed as filler, but only after
        // Labs, Rocket upgrades, armor, Robotic Manufacturing and Generator Mk3
        // have no currently pursuable work left (their scores above always win).
        if (prefix("R-Wpn-Laser") || toward("R-Wpn-Laser01")) return NORMAL+3000+cost
        if (id=="R-Wpn-Missile2A-T" || toward("R-Wpn-Missile2A-T") ||
            id=="R-Cyborg-Hvywpn-A-T") return NORMAL+3100+cost

        // Other non-Rocket weapons remain cleanup only.
        if (prefix("R-Wpn-") && !prefix("R-Wpn-Rocket")) return LOW+4000+cost
    }

    //early
    if (toward("R-Vehicle-Prop-Halftracks"))return HIGH-200     
    if (toward("R-Wpn-MG-Damage01"))return HIGH-100
    if (!done("R-Struc-Factory-Module"))
    {
        if (toward("R-Struc-Research-Upgrade09"))return dumbSchema==SCHEMA_ROCKET ? HIGH-4000 : HIGH-200
        if (toward("R-Struc-Factory-Module"))return dumbSchema==SCHEMA_ROCKET ? HIGH-2800 : HIGH-200
        if (toward("R-Wpn-MG2Mk1"))return HIGH+100         
        if (dumbSchema!=SCHEMA_ROCKET && toward("R-Wpn-Flamer-Damage01"))return HIGH+150
        if (toward("R-Struc-RepairFacility"))return NORMAL+cost-50
    }
    else
    {
        if (toward("R-Struc-RepairFacility"))return countDroid(DROID_ANY,me)>15?HIGH-450:HIGH+cost-150
    }
    if (!reached("R-Vehicle-Metals01"))
    {
        if (prefix("R-Vehicle-Engine02"))return LOW+cost+1000
    }

    //core doctrine is handled above before generic early-game rules.

    if (prefix("R-Sys-Autorepair-General"))return HIGH-2025
    if (toward("R-Struc-Research-Upgrade09"))return HIGH-1000

    //armor & body

    if (toward("R-Vehicle-Prop-Halftracks"))return HIGH-50

    if (dumbSchema==SCHEMA_HPVCAN)
    {
        if (prefix("R-Struc-Factory-Upgrade"))return HIGH-50
        if (toward("R-Vehicle-Body05"))return HIGH-10 
        if (toward("R-Vehicle-Body06"))return HIGH+10
        if (toward("R-Vehicle-Metals09"))return HIGH+20 
        if (toward("R-Vehicle-Body09"))return HIGH+30
        if (reached("R-Wpn-Cannon4AMk1"))
        {
            if (prefix("R-Sys-Sensor-Upgrade01"))return HIGH-10 
        }

        if (reached("R-Wpn-RailGun01"))
        {
            if (toward("R-Cyborg-Metals09"))return HIGH+cost-200
            if (prefix("R-Cyborg-Hvywpn") && toward("R-Cyborg-Hvywpn-RailGunner"))return HIGH+cost-300
        }
        else
        {
            if (toward("R-Wpn-Mortar-ROF01"))return HIGH+cost-5
            if (toward("R-Cyborg-Metals04"))return HIGH+cost+45  
            if (reached("R-Cyborg-Metals04") && toward("R-Cyborg-Hvywpn-HPV"))return HIGH+cost-200
        }

    }
    else
    {
        if (true || (mortarRatio<.5 && attackedByArtillery<50))
        {
                if (toward("R-Vehicle-Body11"))return HIGH+cost-70
            if (toward("R-Vehicle-Metals04"))return HIGH+cost-70
            if (toward("R-Cyborg-Metals04"))return HIGH+cost-200
            if (prefix("R-Cyborg-Hvywpn"))return HIGH+cost-200
            if (toward("R-Cyborg-Metals06"))return NORMAL+cost-120
            if (toward("R-Vehicle-Metals09"))return NORMAL+cost-120
            if (toward("R-Cyborg-Metals09"))return NORMAL+cost+1
        }
        else
        {
            if (toward("R-Vehicle-Body11"))return HIGH+cost-480
            if (toward("R-Vehicle-Metals09"))return NORMAL+cost-320
            if (toward("R-Cyborg-Metals09"))return NORMAL+cost+600
            if (prefix("R-Cyborg-Hvywpn"))return NORMAL+cost
        }
    }

    //util
    if (toward("R-Struc-Factory-Upgrade09"))
    {
        if (cost>100 && power<5000 && !reached("R-Struc-Power-Upgrade01b"))return LOW

        if (prefix("R-Struc-Factory-Upgrade"))
        {
            if (cost<100 && dumbSchema==SCHEMA_ROCKET)return HIGH
            if (cost>100 && !(reached("R-Cyborg-Metals03") || reached("R-Vehicle-Metals03")))return LOW
            return (power>2000)?HIGH:(power>1000)?NORMAL+cost:NORMAL+cost+2500
        }
        return (power>3500)?HIGH:LOW
    }
    if (toward("R-Struc-Power-Upgrade03a"))
    {
        return (power<1000)?HIGH:(power<2000)?NORMAL-50:(power<5000)?NORMAL+cost+500:LOW
        //if (prefix("R-Struc-Power-Upgrade01") && !reached("R-Struc-Factory-Upgrade04"))return (power<500)?HIGH:LOW
    }


    if (prefix("R-Sys-Sensor-Upgrade01"))return HIGH+cost+100
    if (dumbSchema==SCHEMA_CANNON && prefix("R-Struc-RprFac-Upgrade01") && reached("R-Wpn-Cannon2Mk1"))return HIGH+cost


    switch (dumbSchema)
    {
        case SCHEMA_MACGUN:
            if (prefix("R-Wpn-Laser") || toward("R-Wpn-Laser01"))return HIGH
            if (toward("R-Wpn-MG5"))return HIGH
            if (prefix("R-Wpn-MG"))return HIGH+cost+400
            break

        default:
        case SCHEMA_CANNON:
            if (false && toward("R-Defense-WallTower-DoubleAAgun02"))return HIGH
            if (prefix("R-Wpn-Cannon") || prefix("R-Wpn-Rail"))
            {
                if (prefix("R-Wpn-Rail")) return HIGH
        
                if (toward("R-Wpn-RailGun01"))
                {
                    if (prefix("R-Wpn-Cannon-Damage")) return HIGH
                    if (reached("R-Wpn-Cannon-Damage07"))return HIGH// Accuracy 1,2 & HPV Cannon
                    return LOW+100
                }
                if (toward("R-Wpn-Cannon3Mk1")) return HIGH+cost
                if (reached("R-Wpn-RailGun01"))return LOW+cost+200
                return NORMAL+cost+400
            }
            if (toward("R-Wpn-MG3Mk1"))return HIGH
            break

        case SCHEMA_HPVCAN:
            if (toward("R-Wpn-Laser01"))return HIGH+1
            //if (toward("R-Wpn-MG3Mk1"))return HIGH
            if (prefix("R-Wpn-Cannon"))
            {
                if (done("R-Wpn-RailGun01")) return LOW

                if (prefix("R-Wpn-Cannon2Mk1")) return HIGH-1
                if (prefix("R-Wpn-Cannon-ROF")) return HIGH+1
                if (toward("R-Wpn-Cannon4AMk1")) return HIGH-100
                if (toward("R-Wpn-RailGun01"))
                {
                    if (prefix("R-Wpn-Cannon-Damage")) return HIGH
                    if (reached("R-Wpn-Cannon-Damage07"))return HIGH// Accuracy 1,2 & HPV Cannon
                    return LOW+100
                }
                return LOW+100
            }

            if (prefix("R-Wpn-Rail"))
            {
                if (prefix("R-Wpn-RailGun")) return HIGH-100
                return HIGH-50
            }
            break

        case SCHEMA_ROCKET:
            // Enemy VTOLs: stay on Sunburst / rocket AA. SAM research is excluded.
            if (reached("R-Vehicle-Prop-VTOL",enemy) && toward("R-Defense-Sunburst")) return HIGH-5

            // High-value Rocket unlocks/upgrades are handled by the doctrine block above.
            // Remaining Rocket weapons are ordinary side research.
            if (prefix("R-Wpn-Rocket")) return NORMAL+cost+200
            break

        case SCHEMA_MORTAR:
            //if (toward("R-Wpn-MG3Mk1"))return HIGH
            if (toward("R-Wpn-Mortar3"))return HIGH
            if (toward("R-Defense-MortarPit-Incendiary")) return HIGH+cost+100
            if (toward("R-Wpn-HvyHowitzer")) return HIGH+cost
            if (reached("R-Defense-MortarPit-Incendiary") && toward("R-Defense-HvyHowitzer")) return HIGH
            if (prefix("R-Wpn-Mortar") || prefix("R-Wpn-Howitzer"))
            {
                if (prefix("R-Wpn-Mortar-Acc"))return LOW+cost
                if (prefix("R-Wpn-Howitzer-Accuracy"))return LOW+cost
                if (prefix("R-Wpn-Howitzer-ROF")) return HIGH+cost
                if (toward("R-Wpn-Mortar-ROF02")) return HIGH+cost+100

                return NORMAL+cost+600
            }

        case SCHEMA_FLAMER:
            //if (toward("R-Wpn-MG3Mk1"))return HIGH
            if (toward("R-Defense-PlasmiteFlamer")) return HIGH
            if (prefix("R-Wpn-Flamer-"))return HIGH+150
            if (toward("R-Defense-MortarPit-Incendiary")) return NORMAL+cost
            break
    }

    if (prefix("R-Struc-RprFac-Upgrade"))
    {
        return (toward("R-Vehicle-Metals03"))?NORMAL+cost+200:LOW-250
    }

    //late research
    if (reached("R-Struc-Research-Upgrade08"))
    {
        if (toward("R-Vehicle-Body09"))return reached("R-Vehicle-Metals05") ? NORMAL-100 : NORMAL+cost+100
        //if (toward("R-Vehicle-Body12"))return NORMAL+cost+200
        if (toward("R-Vehicle-Engine06"))return dumbSchema==SCHEMA_ROCKET ? LOW+5000+cost : NORMAL+cost+175
        if (toward("R-Vehicle-Body10"))return NORMAL+cost+300
        if (toward("R-Vehicle-Body14"))return  NORMAL+cost+500

        if (prefix("R-Vehicle-Prop"))return LOW+50
        if (toward("R-Defense-HvyHowitzer"))return LOW+100
        if (toward("R-Wpn-LasSat"))return LOW+150
        if (toward("R-Defense-MassDriver"))return LOW+200
        // Missile/SAM cleanup targets intentionally omitted.
        if (prefix("R-Sys"))return LOW+300
        if (prefix("R-Struc"))return LOW+300
        
    }

    if (id=="R-Vehicle-Body04")return LOW+300
    return LOW+1000
}


function goodResearch2(id="")
{
    return goodResearch(id)-getResearch(id,me).points/100000
}

//#region END

function monoResearch(lab)
{
    var research=enumResearch().filter(i=>!dumb25aMissileResearch(i.id) && !dumb25aRocketThermalResearch(i.id) && !dumb25aRocketUnusedBodyResearch(i.id) && !dumb25aRocketDeadWeaponResearch(i.id) && !dumb25aRocketForbiddenPropulsionResearch(i.id))
    if (research.length==0) return

    pursueResearch(lab,min(research,i=>goodResearch2(i.id)).id)
}



function dumbResearch()
{
    var lab=enumStruct(me,RESEARCH_LAB)
    lab.filter(structureIdle).forEach(monoResearch)
}

/** An event that is run whenever a new research is available. The structure
parameter is set if the research comes from a research lab owned by the
current player. If an ally does the research, the structure parameter will
be set to null. The player parameter gives the player it is called for. 
* @param {_research} research
* @param {_struct} structure
* @param {Number} player
*/
/*
function eventResearched(research, structure, player) 
{
    if (player!==me)return
    if (gameTime<100)return
    monoResearch(structure)
}*/
