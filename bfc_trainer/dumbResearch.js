//higher priority = will be researched first
const researches = {
    "R-Wpn-Rocket-Damage01": 100000,
    "R-Wpn-Rocket-Damage02": 100000,
    "R-Wpn-Rocket-Damage03": 100000,
    "R-Wpn-Rocket-Damage04": 100000,
    "R-Wpn-Rocket-Damage05": 100000, //heat mk 2
    "R-Wpn-Rocket-Damage06": 1,
    "R-Wpn-Rocket-Damage07": 1,
    "R-Wpn-Rocket-Damage08": 1,
    "R-Wpn-Rocket-Damage09": 1,

    "R-Wpn-Missile-Damage01": 100000,
    "R-Wpn-Missile-Damage02": 100000,
    "R-Wpn-Missile-Damage03": 30,

    "R-Wpn-Rocket-Accuracy01": 100,
    "R-Wpn-Rocket-Accuracy02": 2000,
    "R-Wpn-RocketSlow-Accuracy01": 2000,
    "R-Wpn-RocketSlow-Accuracy02": 30,

    "R-Struc-RepairFacility": 500,

    "R-Wpn-Rocket-ROF01": 1000, //rof is important but no need to rush imho
    "R-Wpn-Rocket-ROF02": 100,
    "R-Wpn-Rocket-ROF03": 100,

    "R-Wpn-Missile-ROF01": 1000, //missile rof
    "R-Wpn-Missile-ROF02": 1000,
    "R-Wpn-Missile-ROF03": 30,



    "R-Wpn-Rocket01-LtAT": 10000, //lancer
    "R-Wpn-Rocket07-Tank-Killer": 10000, //tk
    "R-Cyborg-Hvywpn-TK": 10000, //tk borg
    "R-Wpn-Rocket02-MRL": 10000, //mra
    "R-Wpn-Rocket02-MRLHvy": 10000, //hra
    "R-Wpn-Laser01": 100000, //flashlight
    "R-Wpn-Missile2A-T": 100000, //scourge
    "R-Wpn-MdArtMissile": 100000, //seraph
    "R-Cyborg-Hvywpn-A-T": 10000, // super scourge



    "R-Struc-Power-Upgrade01": 30,
    "R-Struc-Power-Upgrade01b": 5,
    "R-Struc-Power-Upgrade01c": 5,
    "R-Struc-Power-Upgrade02": 5,
    "R-Struc-Power-Upgrade03": 5,
    "R-Struc-Power-Upgrade03a": 5, 

    "R-Vehicle-Metals01": 1000,
    "R-Vehicle-Metals02": 1000,
    "R-Vehicle-Metals03": 1000, //comp mk3
    "R-Vehicle-Metals04": 10,
    "R-Vehicle-Metals05": 10,
    "R-Vehicle-Metals06": 10,
    "R-Vehicle-Metals07": 10,
    "R-Vehicle-Metals08": 10,
    "R-Vehicle-Metals09": 10,


    "R-Cyborg-Metals01": 600,
    "R-Cyborg-Metals02": 600,
    "R-Cyborg-Metals03": 400,
    "R-Cyborg-Metals04": 1000,
    "R-Cyborg-Metals05": 20,
    "R-Cyborg-Metals06": 20,
    "R-Cyborg-Metals07": 20,
    "R-Cyborg-Metals08": 20,
    "R-Cyborg-Metals09": 20,


    "R-Sys-Sensor-Upgrade01": 1000,
    "R-Sys-Sensor-Upgrade02": 30,
    "R-Sys-Sensor-Upgrade03": 1000,


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

    "R-Wpn-MortarEMP": 1000000, //emp mortar

    "R-Sys-Autorepair-General": 10000000, //autorepair
    "R-Vehicle-Prop-Hover": 2, //hover  
    "R-Vehicle-Engine03": 1, //cobra     


    "R-Struc-Factory-Upgrade01": 10000,
    "R-Struc-Factory-Upgrade04": 25, //robotic
}



const priorityChangeEvents = [
    {
        "name": "enemy is getting vtol",
        priorityEvent: () => {
            return enumEnemies().some(enemy => getResearch("R-Struc-VTOLFactory", enemy).done)
        },
        "researches":
        {
            "R-Wpn-Sunburst": 10000,
            "R-Wpn-Missile-LtSAM": 10000,
        },
    },
    {
        name: "i got lab 9",
        priorityEvent: () => {
            return getResearch("R-Struc-Research-Upgrade09", me).done
        },
        "researches":
        {
            "R-Comp-CommandTurret02": 100, //for emp mortar
            "R-Vehicle-Body05": 10000, //cobra for emp mortar
        }
    },
    {
        name: "i got scourge",
        priorityEvent: () => {
            return getResearch("R-Wpn-Missile2A-T", me).done
        },
        "researches":
        {
            "R-Struc-Power-Upgrade01b": 20,
            "R-Struc-Power-Upgrade01c": 3,
            "R-Struc-Power-Upgrade02": 3,
            "R-Struc-Power-Upgrade02b": 3,
            "R-Struc-Power-Upgrade02c": 3,

        }
    }
]


function runEvents() {

    priorityChangeEvents.forEach(event => {
        if (event.priorityEvent()) {
            Object.entries(event.researches).forEach(([research, priority]) => {
                researches[research] = priority
            })
            chat(ALL_PLAYERS, event.name)
            event.priorityEvent = () => false
        }
    })
}

function priorityResearch(research) {
    if (researches[research]) {
        return researches[research]
    }
    return "R-Wpn-LasSat" //placeholder lassat
}

function monoResearch(lab) {
    runEvents()
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
