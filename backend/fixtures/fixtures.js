module.exports = {
  "field": [
    {
      "_id": "W2zjTv7icffNaKMhR",
      "status": 3,
      "title": "Technische Berufe",
      "shortCode": "TB",
      "jobs": [
        "Maschinen- und Anlagenführer*in",
        "Packmitteltechnologe*in"
      ],
      "isLegacy": false,
      "icon": "tv",
      "meta": {
        "updatedAt": new Date(1647330316526),
        "updatedBy": "dMAb3sr3vo2a7t3hc"
      }
    }
  ],
  "unit": [
    {
      "_id": "SvqRmPBqs76oi26i7",
      "status": 0,
      "unitSet": "pAkQLcMhTHGDp2PL3",
      "shortCode": "TB_1001_W0001",
      "stimuli": [
        {
          "type": "text",
          "subtype": "text",
          "value": "In der Produktionshalle ist es laut. Die Worte seiner Kollegen versteht Anil nicht immer.",
          "hidden": false,
          "width": "12",
          "contentId": "ccCaKJRiDyGnu8iAz"
        },
        {
          "type": "media",
          "subtype": "image",
          "value": "https://content.lealernen.de/cdn/storage/mediaLib/nByymAyaaNXQiwDzz/original/nByymAyaaNXQiwDzz.png",
          "width": "12",
          "contentId": "69fmWB54rZfyKfp7c"
        }
      ],
      "instructions": [
        {
          "type": "text",
          "subtype": "text",
          "value": "Wenn du mit dem Finger auf eine Lücke tippst, erscheint eine Auswahl an Buchstaben und du kannst deine Antwort eingeben.",
          "hidden": false,
          "width": "12",
          "contentId": "7dwZ4ztKkaQnjS8ND"
        }
      ],
      "pages": [
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Welchen Laut hörst du am Anfang des Wortes Bohrer? Schreibe diesen in die Lücke.",
              "hidden": false,
              "width": "12",
              "contentId": "FHiAhhzFyod4Z94pQ"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[B]$$pattern=BPO}}",
                "scoring": [
                  {
                    "competency": [
                      "t88z9T5ncPTaxSXKw"
                    ],
                    "target": 0,
                    "correctResponse": /B/i
                  }
                ]
              },
              "width": "12",
              "contentId": "cu77p4m4PTXmpE2Tx"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Welchen Laut hörst du am Anfang des Wortes Seil? Schreibe diesen in die Lücke.",
              "hidden": false,
              "width": "12",
              "contentId": "L46waa7dsCqH2kRT9"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[S]$$pattern=PFS}}",
                "scoring": [
                  {
                    "competency": [
                      "t88z9T5ncPTaxSXKw"
                    ],
                    "target": 0,
                    "correctResponse": /S/i
                  }
                ]
              },
              "width": "12",
              "contentId": "NPxuqzAFDCHCr93Ax"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Welchen Laut hörst du am Anfang des Wortes Feder? Schreibe diesen in die Lücke.",
              "hidden": false,
              "width": "12",
              "contentId": "qXLkNJtDSRrDjZtWK"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[F]$$pattern=PFS}}",
                "scoring": [
                  {
                    "competency": [
                      "t88z9T5ncPTaxSXKw"
                    ],
                    "target": 0,
                    "correctResponse": /F/i
                  }
                ]
              },
              "width": "12",
              "contentId": "8yrvPcLm6NhQJ7qk9"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Welche Laute hörst du am Anfang der Wörter Licht und Getriebe? \nSchreibe diese in die Lücken.",
              "hidden": false,
              "width": "12",
              "contentId": "eZBvBurPXnurm7ejm"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[L]$$pattern=LIA}}icht\n{{blanks$[G]$$pattern=KHG}}etriebe",
                "scoring": [
                  {
                    "competency": [
                      "t88z9T5ncPTaxSXKw"
                    ],
                    "target": 0,
                    "correctResponse": /L/i
                  },
                  {
                    "competency": [
                      "t88z9T5ncPTaxSXKw"
                    ],
                    "target": 1,
                    "correctResponse": /G/i
                  }
                ]
              },
              "width": "12",
              "contentId": "3ZxXP7RtNndpTZ3rp"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Schreibe das große \"L\" in die Lücke.",
              "hidden": true,
              "width": "12",
              "contentId": "K5fCE7XhFi5WNdEaC"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[L]$$pattern=Ll}}",
                "scoring": [
                  {
                    "competency": [
                      "oMi5oMYNcBbBMKKw9"
                    ],
                    "target": 0,
                    "correctResponse": /L/i
                  }
                ]
              },
              "width": "12",
              "contentId": "qmLnuEBoK9dmhAhzX"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Schreibe das kleine \"g\" in die Lücke.",
              "hidden": true,
              "width": "12",
              "contentId": "A64ZiL3mieSgam4ft"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[g]$$pattern=Gg}}",
                "scoring": [
                  {
                    "competency": [
                      "oMi5oMYNcBbBMKKw9"
                    ],
                    "target": 0,
                    "correctResponse": /g/
                  }
                ]
              },
              "width": "12",
              "contentId": "mC9prFhF32bBBY9cN"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Schreibe das große \"H\" in die Lücke.",
              "hidden": true,
              "width": "12",
              "contentId": "eCKfJjZFrQWyotvWT"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[H]$$pattern=Hh}}",
                "scoring": [
                  {
                    "competency": [
                      "oMi5oMYNcBbBMKKw9"
                    ],
                    "target": 0,
                    "correctResponse": /H/
                  }
                ]
              },
              "width": "12",
              "contentId": "Hc6RQxww82EfP9rfy"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Schreibe das große \"M\" in die Lücke.",
              "hidden": true,
              "width": "12",
              "contentId": "DYGTBvHHSjBohSsbE"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[M]$$pattern=Mm}}",
                "scoring": [
                  {
                    "competency": [
                      "oMi5oMYNcBbBMKKw9"
                    ],
                    "target": 0,
                    "correctResponse": /M/
                  }
                ]
              },
              "width": "12",
              "contentId": "bNeCFsbpA2wEZWrE3"
            }
          ]
        },
        {
          "content": [
            {
              "type": "text",
              "subtype": "text",
              "value": "Schreibe das kleine \"o\" in die Lücke.",
              "hidden": true,
              "width": "12",
              "contentId": "aYoHFzqb6KdgfYmJC"
            },
            {
              "type": "item",
              "subtype": "cloze",
              "value": {
                "text": "{{blanks$[o]$$pattern=Oo}}",
                "scoring": [
                  {
                    "competency": [
                      "oMi5oMYNcBbBMKKw9"
                    ],
                    "target": 0,
                    "correctResponse": /o/
                  }
                ]
              },
              "width": "12",
              "contentId": "3Ty6H8Meu4KzmiBX6"
            }
          ]
        }
      ],
      "meta": {
        "createdBy": "p6kSPxYXgnNEryye3",
        "createdAt": new Date(1632349148673),
        "history": [],
        "updatedAt":  new Date(1638959613777),
        "updatedBy": "kBdFvdDYmPnsA6GbC"
      }
    }
  ],
  "unitSet": [
    {
      "_id": "pAkQLcMhTHGDp2PL3",
      "status": 0,
      "shortCode": "TB_1001",
      "dimension": "REGFavxYPo2CzeM6p",
      "dimensionShort": "W",
      "level": "haPT6fbacjmegsBxq",
      "field": "W2zjTv7icffNaKMhR",
      "isLegacy": false,
      "story": [
        {
          "type": "text",
          "subtype": "text",
          "value": "Nächste Woche darf Anil an einer neuen Maschine, einer Fräsmaschine, arbeiten. Bevor er eingesetzt wird, muss er jedoch noch mal ein bisschen was über diese Maschine lernen.",
          "hidden": false,
          "width": "12",
          "contentId": "kAE5gktcHj4CMtFZy"
        },
        {
          "type": "media",
          "subtype": "image",
          "value": "https://content.lealernen.de/cdn/storage/mediaLib/oRmNERmQXr6fsbcGQ/original/oRmNERmQXr6fsbcGQ.png",
          "width": "12",
          "contentId": "E6FCPLuNvgjpxES8E"
        }
      ],
      "meta": {
        "createdBy": "p6kSPxYXgnNEryye3",
        "createdAt": new Date(1632323516802),
        "history": [],
        "updatedAt": new Date(1638958430798),
        "updatedBy": "kBdFvdDYmPnsA6GbC"
      },
      "units": [
        "SvqRmPBqs76oi26i7"
      ],
      "progress": 9
    }
  ],
  "dimension": [
    {
      "_id": "REGFavxYPo2CzeM6p",
      "status": 3,
      "title": "Schreiben",
      "description": "(Recht)Schreiben",
      "icon": "pen-alt",
      "colorType": 5,
      "shortCode": "W",
      "shortNum": 1
    }
  ],
  "level": [
    {
      "_id": "haPT6fbacjmegsBxq",
      "status": 0,
      "title": "Level 1",
      "description": "lea.app Level 1",
      "meta": {
        "createdBy": "dMAb3sr3vo2a7t3hc",
        "createdAt": new Date(1626083614763),
        "history": [],
        "updatedAt": new Date(1647330186516),
        "updatedBy": "dMAb3sr3vo2a7t3hc"
      },
      "isLegacy": false,
      "level": 1
    }
  ],
  "testCycle": [
    {
      "_id": "vf7xTLRqbgeuuE6kS",
      "shortCode": "Test_TB_WLevel 1",
      "field": "W2zjTv7icffNaKMhR",
      "dimension": "REGFavxYPo2CzeM6p",
      "level": "haPT6fbacjmegsBxq",
      "isLegacy": false,
      "unitSets": [
        "pAkQLcMhTHGDp2PL3"
      ],
      "meta": {
        "createdBy": "kBdFvdDYmPnsA6GbC",
        "createdAt": new Date(1635330473005),
        "history": [],
        "updatedAt": new Date(1635958247725),
        "updatedBy": "kBdFvdDYmPnsA6GbC"
      },
      "progress": 30
    }
  ]
}