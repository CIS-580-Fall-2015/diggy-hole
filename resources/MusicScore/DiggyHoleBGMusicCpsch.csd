<CsoundSynthesizer>
<CsOptions>
-o DiggyHoleBGMusicAm.wav		; The output file for rendering.
</CsOptions>
<CsInstruments>
; Title: 			DiggyHoleBGMusicCpsch.csd
; Version Date:	ad-2015/ 11 / 19
; Contributors: 	Kyle Brown
; Documentation Language: English
;
; ===========
; Description
; ===========
; This pieces features synth like sound in the the A minor key.
;
; ======
; Tuning
; ======
; This piece uses Csound's cpsch tuning for the musical score.
; Note calls designate a note by O.N where O is the Octave and N is the Note number.
;
; A reasonable octave hearing range is from 5 to 10
; Octave 
; cpsch octave  C-scale octave
; ------------		--------
;	4					0
;	5					1
;	6					2
;	7					3
;	8					4
;	9					5
;	10					6

; Note numbering follows an Cpsch scale, 
; N	Note
; --  -----
; 00	C
; 01	C#
; 02	D
; 03	Eb
; 04	E
; 05	F
; 06	F%
; 07	G
; 08	Ab
; 09	A
; 10	Bb
; 11	B
;
; Example Notes:
; 6.00 = C6
; 6.09 = A6
; 6.11 = B6
; 7.00 = C7
; 7.09 = A7
; 8.09 = A8
; Where A8 is equal to A4(440 hz) in Concert A tuning
;
;
;
;
;
; ================
; Global Settings
; ================
sr = 44100	; The sampling rate; STANDARD-001 is 44,100 samples/second.
kr = 4410	; The k data control rate; typically set to 10% of sr, but maybe lower for higher sampling rate, as it could tax the procressing power
ksmps = 10	; The number of k samples; set to 10 for a baseline number
nchnls = 2	; The number of channels of sound output; typically set for 2 for stereo output


; ================
; Global Variables
; ================
seed 0			; The global seed for the program. Current default = 0

ga1 init 0  	; A bus for global audio that any instrument can use
ga2 init 0  	; A bus for global audio that any instrument can use



; =======================
; Instruments Declaration
; =======================
instr 201	; An instrument with an exponential amplitude envelope, tremelo and glissando functions with a slight panning effect.
idur = p3			; The duration
iamp = ampdb(p4)	; The amplitude in decibals; (0 ~ 100)
ifreq = cpspch(p5)	; The frequency of the note, in cpsch scale. (5.00 ~ 10.00)
ifn = p6					; The function the oscillator uses. (see Waveforms)
ia = p7					; The begining value of the exponential amplitude envelope. ( .0001 - 1)
ib = p8					; The ending value of the exponential amplitude envelope. (.0001 - 1)
itremAmount = p9		; Tremolo amount, 0 for none.(0 ~ ???)
iglissPitch = cpspch(p10) ; The frequency the note will glissando to, in cpsch scale. (5.00 ~ 10.00)
ipanFreq = p11					; The panning frequency.  Low numbers produce best results. (0 ~ 10)
ipanWaveForm = p12			; The panning waveform. (see Waveforms)
kglissfreq = 1/idur/4.0					; The glissando frequency, quarter of sine wave. 
kglissdiff = iglissPitch - ifreq		; The difference in ending and starting pitch.

kexpEnv1 = expseg ia, idur, ib)
kexpEnv2 = expseg ia, idur, ib)
kpitch oscil .3, itremAmount, 29

kgliss oscil 1, kglissfreq, 13			; glissando 1/4 length sine wave


kpanL oscil .3, ipanFreq, ipanWaveForm, .25
kpanR oscil .3, ipanFreq, ipanWaveForm, .75


asignal oscil iamp*kexpEnv1*(1-kpitch), ifreq+kgliss*kglissdiff, ifn
	outs asignal * (.5+kpanL), asignal * (.5+kpanR)
	endin

instr 202	; A frequency based implementation of instrument 202
idur = p3
iamp = ampdb(p4)
ifreq = p5
ifn = p6
ia = p7
ib = p8
itremAmount = p9
iglissPitch = p10
ipanFreq = p11
ipanWaveForm = p12
kglissfreq = 1/idur/4.0					; glissando frequency, quarter of sine wave
kglissdiff = iglissPitch - ifreq		; difference in ending and starting pitch

kexpEnv1 = expseg ia, idur, ib)
kexpEnv2 = expseg ia, idur, ib)
kpitch oscil .3, itremAmount, 29

kgliss oscil 1, kglissfreq, 13			; glissando 1/4 length sine wave


kpanL oscil .3, ipanFreq, ipanWaveForm, .25
kpanR oscil .3, ipanFreq, ipanWaveForm, .75


asignal oscil iamp*kexpEnv1*(1-kpitch), ifreq+kgliss*kglissdiff, ifn
	outs asignal * (.5+kpanL), asignal * (.5+kpanR)
	endin
	
	
	
	
	instr 203	; A variable tuning based implementation of instrument 202 for a 12 step musical scale
					; Works well with ituning = 440 for concert A tuning.
					; Different from cpsch, note numbering starts at A instead of C.
idur = p3
iamp = ampdb(p4)
ituning = p5		; The A4 frequency, 
inoteoct = p6 		; note octave		(n)			;Acceptable values are 0 - 7
inotenum = p7 		; note number		(n)			;Acceptable values are 1-12
ifn = p8
ia = p9
ib = p10
itremAmount = p11
iglissPitch = p12
ipanFreq = p13
ipanWaveForm = p14




ibasefreq = 0;				; For calculating note frequenc;, is tuning frequency
ifreq = 0;					; The frequency of note; Calculated based of tuning, note octave, and note number
ibasefreq = ituning;


; Calculate the frequency of note
ibasenum = inotenum+inoteoct*12
;print ibasenum
ifreq = powoftwo((ibasenum-49)/12)*ibasefreq			; Calculates the frequency using a 12 step musical scale
;print ifreq       ; For debugging print frequency


iglissPitch = ifreq												; Sets gliss to frequency for NO gliss


; For debugging, or reading output; Uses A Scale numbering(not C-Scale)
if (inotenum == 1) then
printf "A%d : %d,",1,inoteoct, ifreq			;A
elseif (inotenum == 2) then
printf "Bb%d: %d,",1,inoteoct, ifreq			;Bb
elseif (inotenum == 3) then
printf "B%d: %d,",1,inoteoct, ifreq			;B
elseif (inotenum == 4) then
printf "C%d: %d,",1,inoteoct, ifreq			;C
elseif (inotenum == 5) then
printf "Csharp%d: %d,",1,inoteoct, ifreq	;C#
elseif (inotenum == 6)then
printf "D%d: %d,",1,inoteoct, ifreq			;D
elseif (inotenum == 7) then
printf "Eb%d: %d,",1,inoteoct, ifreq			;Eb
elseif (inotenum == 8) then
printf "E%d: %d,",1,inoteoct, ifreq			;E
elseif (inotenum == 9) then
printf "F%d: %d,",1,inoteoct, ifreq			;F
elseif (inotenum == 10) then
printf "Fsharp%d: %d,",1,inoteoct, ifreq	;F#
elseif (inotenum == 11) then
printf "G%d: %d,",1,inoteoct, ifreq			;G
elseif (inotenum == 12) then
printf "Ab%d: %d,",1,inoteoct, ifreq			;Ab
endif

kglissfreq = 1/idur/4.0					; glissando frequency, quarter of sine wave
kglissdiff = iglissPitch - ifreq		; difference in ending and starting pitch

kexpEnv1 = expseg ia, idur, ib)
kexpEnv2 = expseg ia, idur, ib)
kpitch oscil .3, itremAmount, 29

kgliss oscil 1, kglissfreq, 13			; glissando 1/4 length sine wave


kpanL oscil .3, ipanFreq, ipanWaveForm, .25
kpanR oscil .3, ipanFreq, ipanWaveForm, .75


asignal oscil iamp*kexpEnv1*(1-kpitch), ifreq+kgliss*kglissdiff, ifn
	outs asignal * (.5+kpanL), asignal * (.5+kpanR)
	endin
	
	
	
</CsInstruments>
<CsScore>
; =========
; Waveforms
; =========
; increasing size sine waves
f 1  0 2 	10 1
f 2  0 4 	10 1
f 3  0 8		10 1
f 4  0 16	10 1
f 5  0 32	10 1
f 6  0 64 	10 1
f 7  0 128 	10 1
f 8  0 256 	10 1
f 9  0 512	10 1
f 10 0 1024	10 1
f 11 0 2048	10 1
f 12 0 4096 10 1 ; A medium fidelity sine wave,  4096 samples.
f 13 0 8192 10 1

; Incresing size square waves through 13 partials
f 21 0 2		10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 22 0 4		10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 23 0 8		10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 24 0 16	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 25 0 32	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 26 0 64	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 27 0 128	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 28 0 256	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 29 0 512	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 30 0 1024	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
f 31 0 2048	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
;f 32 0 4096	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13
;f 33 0 8192	10	1	0	1/3	0	1/5	0	1/7	0	1/9	0	1/11	0	1/13

; Spline Draws
f 80 0 513 	8 0 150 0.5 50 1 113 1 50 0.5 150 0 ;Quasi-Gaussian
f 81 0 513 	8 0 10 0.5 50 1 113 1 50 0.5 290 0 ;Quasi-Gaussian
;f 82 0 513 	8 0 150 0.5 50 1 113 .7 50 0.25 150 0 ;Quasi-Gaussian
f 83 0 513 	8 0 50 1 50 .7 113 .7 50 0.5 200 0 ;Quasi-Gaussian

; =============
; Musical Score
; =============
; DiggyHoleBgMusicAm
; Score: Var1, Var1Oct , Var2, Var2Oct
; Instruments: 201

t 0 103	; Timing set to 103 beats per minute

; 1   2    3   4  5    6  7  8     9   10   11       12
; i  st  dur amp cpsc fn ia ib  trem glisto panfreq panfn
; Variation 1
i 201 0 		8 	80 6.09 81 	1	.001	0  6.09	.5	11		; A2
i 201 .5		8	80 7.02	.	1	.001	.	7.02	.	.		; D3
i 201 1		8	80 7.09	.	1	.001	.	7.09	.	.		; A3
i 201 1.5	8	80 8.00	.	1	.001	.	8.00	.	.		; C4

i 201 5 		8 	80 6.09	. 	1	.001	.	6.09 	.	.		; A2
i 201 5.5	8	80 7.02	.	1	.001	.	7.02	.	.		; D3
i 201 6		8	80 7.09	.	1	.001	.	7.09	.	.		; A3
i 201 6.5	8	80 7.11	.	1	.001	.	7.11	.	.		; B3

i 201 10 	8 	80 6.09	. 	1	.001	.	6.09 	.	.	
i 201 10.5	8	80 7.02	.	1	.001	.	7.02	.	.
i 201 11		8	80 7.09	.	1	.001	.	7.09	.	.
i 201 11.5	8	80 8.00	.	1	.001	.	8.00	.	.

i 201 15 	8 	80 6.09	. 	1	.001	.	6.09 	.	.
i 201 15.5	8	80 7.02	.	1	.001	.	7.02	.	.
i 201 16		8	80 7.09	.	1	.001	.	7.09	.	.
i 201 16.5	8	80 7.11	.	1	.001	.	7.11	.	.

; Variation 1 Octave
i 201 20 	8 	80 6.09	81 1	.001	.	6.09 	.	.
i 201 20.5	8	80 8.02	.	1	.001	.	8.02	.	.
i 201 21		8	80 8.09	.	1	.001	.	8.09	.	.	
i 201 21.5	8	80 9.00	.	1	.001	.	9.00	.	.

i 201 25 	8 	80 6.09	. 	1	.001	.	6.09 	.	.
i 201 25.5	8	80 8.02	.	1	.001	.	8.02	.	.
i 201 26		8	80 8.09	.	1	.001	.	8.09	.	.
i 201 26.5	8	80 8.11	.	1	.001	.	8.11	.	.

i 201 30 	8 	80 6.09	. 	1	.001	.	6.09 	.	.	
i 201 30.5	8	80 8.02	.	1	.001	.	8.02	.	.
i 201 31		8	80 8.09	.	1	.001	.	8.09	.	.
i 201 31.5	8	80 9.00	.	1	.001	.	9.00	.	.

i 201 35 	8 	80 6.09	. 	1	.001	.	6.09 	.	.
i 201 35.5	8	80 8.02	.	1	.001	.	8.02	.	.
i 201 36		8	80 8.09	.	1	.001	.	8.09	.	.
i 201 36.5	8	80 8.11	.	1	.001	.	8.11	.	.

; Varation 2 
i 201 40 	8 	80 7.02	83 1	.001	.	7.02 	.	.
i 201 40.5	8	80 7.09	.	1	.001	.	7.09	.	.
i 201 41		8	80 8.00	.	1	.001	.	8.00	.	.
i 201 41.5	8	80 8.07	.	1	.001	.	8.07	.	.

i 201 45 	8 	80 7.02	. 	1	.001	.	7.02 	.	.
i 201 45.5	8	80 7.09	.	1	.001	.	7.09	.	.
i 201 46		8	80 8.00	.	1	.001	.	8.00	.	.
i 201 46.5	8	80 8.06	.	1	.001	.	8.06	.	.

i 201 50 	8 	80 7.02	. 	1	.001	.	7.02 	.	.
i 201 50.5	8	80 7.09	.	1	.001	.	7.09	.	.
i 201 51		8	80 8.00	.	1	.001	.	8.00	.	.
i 201 51.5	8	80 8.07	.	1	.001	.	8.07	.	.

i 201 55 	8 	80 7.02	. 	1	.001	.	7.02 	.	.
i 201 55.5	8	80 7.09	.	1	.001	.	7.09	.	.
i 201 56		8	80 8.00	.	1	.001	.	8.00	.	.
i 201 56.5	8	80 8.06	.	1	.001	.	8.06	.	.

; Varation 2 Octave
i 201 60 	8 	80 8.02	. 	1	.001	.	8.02 	.	.
i 201 60.5	8	80 8.09	.	1	.001	.	8.09	.	.
i 201 61		8	80 9.00	.	1	.001	.	9.00	.	.
i 201 61.5	8	80 9.07	.	1	.001	.	9.07	.	.
i 201 65 	8 	80 8.02	. 	1	.001	.	8.02 	.	.
i 201 65.5	8	80 8.09	.	1	.001	.	8.09	.	.
i 201 66		8	80 9.00	.	1	.001	.	9.00	.	.
i 201 66.5	8	80 9.06	.	1	.001	.	9.06	.	.

i 201 70 	8 	80 8.02	. 	1	.001	.	8.02 	.	.
i 201 70.5	8	80 8.09	.	1	.001	.	8.09	.	.
i 201 71		8	80 9.00	.	1	.001	.	9.00	.	.
i 201 71.5	8	80 9.07	.	1	.001	.	9.07	.	.

i 201 75 	8 	80 8.02	. 	1	.001	.	8.02 	.	.
i 201 75.5	8	80 8.09	.	1	.001	.	8.09	.	.
i 201 76		8	80 9.00	.	1	.001	.	9.00	.	.
i 201 76.5	8	80 9.06	.	1	.001	.	9.06	.	.
e


</CsScore>
</CsoundSynthesizer>
<bsbPanel>
 <label>Widgets</label>
 <objectName/>
 <x>100</x>
 <y>100</y>
 <width>320</width>
 <height>240</height>
 <visible>true</visible>
 <uuid/>
 <bgcolor mode="nobackground">
  <r>255</r>
  <g>255</g>
  <b>255</b>
 </bgcolor>
</bsbPanel>
<bsbPresets>
</bsbPresets>
