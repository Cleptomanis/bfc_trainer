//higher priority = will be researched first
const researches = {
    "R-Wpn-Rocket-Damage01": 100000,
    "R-Wpn-Rocket-Damage02": 100000,
    "R-Wpn-Rocket-Damage03": 100000,
    "R-Wpn-Rocket-Damage04": 100000,
    "R-Wpn-Rocket-Damage05": 100000, //heat mk 2
    "R-Wpn-Rocket-Damage06": 10,
    "R-Wpn-Rocket-Damage07": 10,
    "R-Wpn-Rocket-Damage08": 10,
    "R-Wpn-Rocket-Damage09": 10,


    "R-Wpn-Rocket-Accuracy01": 100,
    "R-Wpn-Rocket-Accuracy02": 1000,
    "R-Wpn-RocketSlow-Accuracy01": 1000,
    "R-Wpn-RocketSlow-Accuracy02": 10,


    "R-Wpn-Rocket-ROF01": 1000, //rof is important but no need to rush imho
    "R-Wpn-Rocket-ROF02": 100,
    "R-Wpn-Rocket-ROF03": 100,


    "PENIS": 69,


    "R-Wpn-Rocket01-LtAT": 10000, //lancer
    "R-Wpn-Rocket07-Tank-Killer": 10000, //tk
    "R-Cyborg-Hvywpn-TK" : 10000, //tk borg
    "R-Wpn-Rocket02-MRL": 10000, //mra
    "R-Wpn-Rocket02-MRLHvy": 10000, //hra


    "R-Vehicle-Metals01": 1000,
    "R-Vehicle-Metals02": 1000,
    "R-Vehicle-Metals03": 1000, //comp mk3
    "R-Vehicle-Metals04": 10,

    "R-Cyborg-Metals01": 10,
    "R-Cyborg-Metals02": 10,
    "R-Cyborg-Metals03": 10,
    "R-Cyborg-Metals04": 10,

    
    "R-Vehicle-Body02": 10000, //leopard


    "R-Struc-Research-Upgrade01": 100000000,
    "R-Struc-Research-Upgrade02": 100000000,
    "R-Struc-Research-Upgrade03": 100000000,
    "R-Struc-Research-Upgrade04": 100000000,
    "R-Struc-Research-Upgrade05": 100000000,
    "R-Struc-Research-Upgrade06": 100000000,
    "R-Struc-Research-Upgrade07": 100000000,
    "R-Struc-Research-Upgrade08": 100000000,
    "R-Struc-Research-Upgrade09": 100000000,


    "R-Struc-Factory-Upgrade01": 10000,
    "R-Struc-Factory-Upgrade04": 1, //robotic
}


function priorityResearch(research) {
    if (researches[research]) {
        return researches[research]
    }
    return "R-Wpn-LasSat" //placeholder lassat
}

function monoResearch(lab) {
    if (structureIdle(lab)) {
        var research = enumResearch()
        if (research.length == 0) return

        pursueResearch(lab, max(research, i => priorityResearch(i.id)).id)
    }
    return
}



function dumbResearch() {
    var lab = enumStruct(me, RESEARCH_LAB)
    lab.forEach(monoResearch)
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
