<script>
	import { defineComponent } from 'vue';
	import { IonItem, IonList, IonIcon, IonBackButton, IonSearchbar, IonModal, IonListHeader, IonSpinner, loadingController, IonInput, 
	IonButton, actionSheetController, alertController } from '@ionic/vue';

	import axios from 'axios';

	import { App } from '@capacitor/app';
	
	import { linkOutline, linkSharp, qrCodeOutline, qrCodeSharp, schoolOutline, schoolSharp, businessOutline, businessSharp, navigateOutline, navigateSharp, personCircleOutline, personCircleSharp, serverOutline, serverSharp } from 'ionicons/icons';

	import displayToast from '@/functions/utils/displayToast.js';
	import { fetchDaysOffAndHolidays } from '@/functions/utils/datetimePicker.js';

	import { Geolocation } from '@capacitor/geolocation';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonBackButton,
			IonItem,
			IonList,
			IonIcon,
			IonSearchbar,
			IonModal,
			IonListHeader,
			IonSpinner,
			IonInput,
			IonButton
		},
		setup() {
			return { 
				linkOutline,
				linkSharp,
				qrCodeOutline,
				qrCodeSharp,
				schoolOutline,
				schoolSharp,
				serverOutline,
				serverSharp,
				businessOutline,
				businessSharp,
				navigateOutline,
				navigateSharp,
				personCircleOutline,
				personCircleSharp
			}
		},
		mounted() {
			this.getENTs();
			this.GetLocation();
		},
		methods: {
			decodeEntities(encodedString) {
				const translate_re = /&(nbsp|amp|quot|lt|gt|Eacute|eacute|Egrave|egrave);/g;
				const translate = {
					"nbsp": " ",
					"amp" : "&",
					"quot": "\"",
					"lt"  : "<",
					"gt"  : ">",
					"Eacute" : "É",
					"eacute" : "é",
					"Egrave" : "È",
					"egrave" : "è",
				};
				return encodedString.replace(translate_re, function(match, entity) {
					return translate[entity];
				}).replace(/&#(\d+);/gi, function(match, numStr) {
					const num = parseInt(numStr, 10);
					return String.fromCharCode(num);
				});
			},
			async getENTs() {
				const infosAPI = this.$api + "/infos";

				const loading = await loadingController.create({
					message: 'Obtention des ENTS...'
				});
					
				loading.present();
				
				axios.get(infosAPI)
				.then(response => {
					setTimeout(() => {
						loading.dismiss();
					}, 300);
					this.ents = response.data.ent_list;
				})
				.catch(error => {
					setTimeout(() => {
						loading.dismiss();
					}, 300);
					console.error(error)
					displayToast.presentError("Impossible de récupérer les ENTS. La connexion risque de ne pas fonctionner.", "danger", error)
				})
			},    
			async GetLocation() {
				const coordinates = await Geolocation.getCurrentPosition()
				.catch(err => {
					if(err.code === 1) {
						this.permissionWait = false
						this.permissionDeny = true
					}
				})
				const lat = coordinates.coords.latitude;
				const lon = coordinates.coords.longitude;

				this.isLoading = true;
				this.findEstablishments(lat, lon)
			},     
			async createEntPicker(multipleEnts) {
				const options = [];

				for (let i = 0; i < multipleEnts.cas.length; i++) {
					options.push({
						text: multipleEnts.cas[i].name,
						handler: () => {
							const selected = {
								etab : multipleEnts.etab.toLowerCase(),
								cas : multipleEnts.cas[i].py,
								cas_name : multipleEnts.cas[i].name,
								educonnect : multipleEnts.cas[i].educonnect == true,
							}

							this.displayLogin(selected)
						}
					});
				}

				options.push({
					text: 'Annuler',
					role: 'cancel',
					handler: () => {
						displayToast.presentToast("Vous devez choisir un ENT pour continuer.", "danger")
					},
					data: {
						action: 'cancel'
					}
				});

				const actionSheet = await actionSheetController.create({
					header: 'Choisissez votre méthode de connexion',
					subHeader: 'Plusieurs méthodes de connexion sont disponibles pour votre établissement. Choisissez celle que vous souhaitez utiliser.',
					buttons: options
				});

				await actionSheet.present();
			},
			getPostal(e) {
				let postal = e.detail.value

				if (postal.trim().length != 5) {
					if (postal.trim().length == 0) {
						this.clearEtabs();
						this.locationFailed = false;
					}
					return;
				}

				postal = postal.normalize("NFD").replace(/\p{Diacritic}/gu, "");

				if(postal.trim() == "") {
					this.clearEtabs();
					this.locationFailed = false;
					return;
				}

				this.etabs = [];
				this.etabsEmpty = false;
				this.locationFailed = false;
				this.terms = postal;
				this.isLoading = true;
				
				axios.get('https://cors.api.getpapillon.xyz/https://positionstack.com/geo_api.php?query=france+' + postal, {
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
						'Access-Control-Allow-Credentials': 'true'
					}
				})
				.then(response => {                      
					const data = response.data.data;

					const lat = data[0].latitude;
					const lon = data[0].longitude;

					this.foundCity = data[0].locality;

					this.findEstablishments(lat, lon)
				})
				.catch(error => {
					this.isLoading = false;
					this.locationFailed = true;
					console.error("[Get Postal Code]: " + error)
					displayToast.presentError(`Une erreur s'est produite pour obtenir votre code postal.`, "danger", error.stack)
				})
			},
			findEstablishments(lat, lon) {
				this.permissionWait = false
				this.etabsFetching = true
				fetch("https://www.index-education.com/swie/geoloc.php", {
					headers: {
						accept: "*/*",
						"accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
						"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
						"sec-ch-ua":
						'"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": '"Windows"',
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "cross-site",
						"sec-gpc": "1",
					},
					referrer: "http://localhost:8081/",
					referrerPolicy: "strict-origin-when-cross-origin",
					body: 
						"data=%7B%22nomFonction%22%3A%22geoLoc%22%2C%22lat%22%3A" +
						lat +
						"%2C%22long%22%3A" +
						lon +
						"%7D",
					method: "POST",
					mode: "cors",
					credentials: "omit",
				})
				.then((response) => response.json())
				.then((data) => {
					this.etabs = data;
					this.etabsFetching = false;
					if (this.etabs.length == 0) {
						this.etabsEmpty = true;
					} else {
						this.etabsEmpty = false;
					}

					if (JSON.stringify(data) == "{}") {
						this.locationFailed = true;
					} else {
						this.locationFailed = false;
					}

					// remove all etabs with no URL
					for (let i = 0; i < this.etabs.length; i++) {
					if (this.etabs[i].url == "" || this.etabs[i].url == null) {
						this.etabs.splice(i, 1);
					}
					}

					// decode etabName html entities
					for (let i = 0; i < this.etabs.length; i++) {
						this.etabs[i].nomEtab = this.decodeEntities(this.etabs[i].nomEtab);
					}

					setTimeout(() => {
					this.isLoading = false;
					}, 200);
				})
				.catch((error) => {
					console.error("[Find Establishment]: " + error);

					if (this.retries < 3) {
					setTimeout(() => {
						this.findEstablishments(lat, lon);
					}, 1000);
					this.retries++;
					} else {
					this.isLoading = false;
					this.locationFailed = true;
					displayToast.presentError(
						`Une erreur s'est produite pour obtenir les établissements à proximité.`,
						"danger",
						error.stack
					);
					}
				})
			},
			clearEtabs() {
				this.etabs = [];
				this.etabsEmpty = true;
			},
			async URLLogin() {
				const alert = await alertController.create({
					header: 'Connexion avec une URL Pronote',
					message: 'Veuillez entrer l\'URL de votre établissement Pronote.',
					mode: 'md',
					buttons: [
						{
							text: 'Annuler',
							role: 'cancel',
							cssClass: 'btn_secondary',
							handler: () => {
								alert.dismiss();
							}
						}, {
							text: 'Se connecter',
							handler: (data) => {
								let etaburl = data.url;

								if (etaburl == '') {
									displayToast.presentToast('Veuillez entrer une URL valide.', 'danger');
									return;
								}

								// remove everything after the last / if includes 'eleve.html'
								if(etaburl.includes('eleve.html')) {
									etaburl = etaburl.split('/').slice(0, -1).join('/');
								}

								this.loginToEtab(etaburl, null, true);
							}
						}
					],
					inputs: [
						{
							name: 'url',
							type: 'url',
							placeholder: 'https://XXXXXXXY.index-education.net/pronote'
						}
					]
				});

				await alert.present();
			},
			loginToDemo() {
				this.loginToEtab("https://demo.index-education.net/pronote");

				setTimeout(() => {
					this.$refs.user.$el.value = "demonstration";
					this.$refs.pass.$el.value = "pronotevs";

					this.login();
				}, 1000);
			},
			async loginToEtab(url, cp, customUrl = false) {
				// lowercase url
				url = url.toLowerCase();
				let etab = url.toLowerCase();

				let isToutatice = false;

				// check if cp (integer) starts with 35, 22, 56, or 29 (Bretagne)
				if(cp) {
					if(cp.toString().startsWith("35") || cp.toString().startsWith("22") || cp.toString().startsWith("56") || cp.toString().startsWith("29")) {
						isToutatice = true;
					}
				}

				// start loading
				this.isLoading = true;

				if(!etab.includes("eleve.html")) {
					if(etab.includes("/pronote/")) {
						etab = etab + "eleve.html";
					}
					else {
						etab = etab + "/" + "eleve.html";
					}
				}
				const loading = await loadingController.create({
					message: 'Veuillez patienter...'
				});
					
				loading.present();
				// get ENT
				axios.get(`https://api.androne.dev/papillon-v4/redirect.php?url=${encodeURIComponent(etab)}`)
				.then(response => {
					// end loading
					this.isLoading = false;
					loading.dismiss()
					const resp = response.data.url;
					let cas_host = resp.split('/')[2];
					cas_host = cas_host.split('/')[0] || cas_host;
					if(cas_host.includes("index-education.net")) {
						cas_host = "index-education.net";
					}
					// more toutatice weird stuff
					if(cas_host.includes("pronote.toutatice.fr")) {
						cas_host = "www.toutatice.fr";
					}

					const all_cas_same_host = this.ents.filter(cas => {
						if(cas.url.includes("*.")) {
							cas_host = cas_host.split('.')[1];
							cas.url = cas.url.split('.')[1];
						}
						return cas.url == cas_host
					});

					let cas = all_cas_same_host[0];
					if (all_cas_same_host.length == 0) {
						// no CAS for this host
						if (customUrl) {
							all_cas_same_host.push({
								name: "Connexion directe via Pronote",
								url: "index-education.net",
								py: "",
								educonnect: false,
							})
							cas = all_cas_same_host[0].py;
						}
						else {
							displayToast.presentToast(`Aucun CAS trouvé pour ${cas_host}.`, "danger")
						}
					}
					else if (all_cas_same_host.length == 1 && all_cas_same_host[0].url == "index-education.net") {
						// only one CAS for this host and not an ENT
						cas = all_cas_same_host[0].py;
					}
					else if (all_cas_same_host.length >= 1) {
						// multiple CAS for this host
						all_cas_same_host.push({
							name: "Connexion directe via Pronote",
							url: "index-education.net",
							py: "",
							educonnect: false,
						})

						const listToChoose = {
							etab : etab.toLowerCase(),
							cas : all_cas_same_host,
						};

						this.createEntPicker(listToChoose);
						return;
					}

					// TODO: Vérifier si ca fonctionne pour toutatice
					if(isToutatice) {
						// car toutatice est chelou
						this.loginToEtab(url.replace("index-education.net", "pronote.toutatice.fr"));
					}
					else {
						// put etab to lowercase
						etab = etab.toLowerCase();

						const selected = {
							etab : etab,
							cas : cas,
							cas_name : all_cas_same_host[0].name,
							educonnect : all_cas_same_host[0].educonnect == true,
						}

						this.displayLogin(selected)
					}
				})
			},
			displayLogin(selected) {
				this.etabUrl = selected.etab;
				this.etabCas = selected.cas;
				this.displayCas = selected.cas_name;
				this.isEduconnectLogin = selected.educonnect;

				this.$refs.loginModal.$el.present()
			},
			dismiss() {
				this.$refs.loginModal.$el.dismiss();
			},
			async changeApi() {
				const rebootAlert = await alertController.create({
					header: 'Redémarrage requis',
					message: 'Vous devez redémarrer l\'application pour appliquer les changements.',
					mode: 'md',
					buttons: [
						{
							text: 'Plus tard',
							role: 'cancel',
							cssClass: 'btn_secondary',
							handler: () => {
								alert.dismiss();
							}
						}, {
							text: 'Quitter',
							handler: () => {
								App.exitApp();
							}
						}
					]
				});


				const alert = await alertController.create({
					header: 'URL personnalisée',
					message: 'Entrez l\'URL personnalisée de l\'API',
					mode: 'md',
					buttons: [
						{
							text: 'Réinitialiser',
							role: 'reset',
							cssClass: 'btn_secondary',
							handler: () => {
								displayToast.presentToast(
									'API personnalisée réinitialisée',
									'danger'
								);

								localStorage.removeItem('customApiUrl');

								alert.dismiss();
							}
						}, {
							text: 'OK',
							handler: (value) => {
								localStorage.setItem('customApiUrl', value.url);
								displayToast.presentToast(
									'URL d\'API personnalisée enregistrée',
									'success'
								);

								rebootAlert.present();
							}
						}
					],
					inputs: [
						{
							name: 'url',
							type: 'url',
							placeholder: 'https://api.example.com',
							value: localStorage.getItem('customApiUrl')
						}
					],
				});

				await alert.present();
			},
			async login() {
				const API = this.$api;

				const username = this.$refs.user.$el.value;
				const password = this.$refs.pass.$el.value;
				const cas = this.etabCas;
				let url = this.etabUrl;

				if (cas == '') {
					url = url + '?login=true'
				}

				const myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
				
				const urlencoded = new URLSearchParams();
				urlencoded.append("url", url);
				urlencoded.append("ent", cas);
				urlencoded.append("username", username);
				urlencoded.append("password", password);

				const requestOptions = {
					method: 'POST',
					headers: myHeaders,
					body: urlencoded,
					redirect: 'follow'
				};

				const loading = await loadingController.create({
					message: 'Connexion en cours...'
				});
					
				loading.present();

				fetch(API + "/generatetoken", requestOptions)
					.then(response => response.json())
					.then(async result => {
						if(!result.token) {
							loading.dismiss()
							if(result.error.includes("probably wrong login information") || result.error.includes("probably bad username/password")) {
								displayToast.presentError("Identifiants incorrects.", "danger", result.error)
							} else if(result.error == "Missing username") {
								displayToast.presentToast("Veuillez entrer un identifiant.", "danger")
							} else if(result.error == "Missing password") {
								displayToast.presentToast("Veuillez entrer un mot de passe.", "danger")
							} else if(result.error == "Your IP address is suspended.") {
								displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
							} else {
								displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
							}
						}
						else {
							const token = result.token;

							// save token
							localStorage.token = token;
							localStorage.loggedIn = true;
							localStorage.loginData = btoa(JSON.stringify({
								username: username,
								password: password,
								cas: cas,
								url: url,
							}));
							localStorage.loginService = "pronote";

							localStorage.setItem("disabledDays", JSON.stringify([0]));
							const ACAD_NAME_API = "https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre&q=&facet=code_postal_uai&facet=nature_uai_libe&facet=libelle_academie&timezone=Europe%2FParis"
							axios.get(ACAD_NAME_API + "&refine.numero_uai=" + url.split("/")[2].split(".")[0].toUpperCase())
								.then(response => response.json())
								.then(result => {
									if(result.records.length > 0) {
										localStorage.setItem("acadName", result.records[0].fields.libelle_academie);
									}
								})

							await fetchDaysOffAndHolidays()

							// go to home
							window.location.replace("/");
						}
					});
			}
		},
		data() {
			return {
				presentingElement: null,
				terms: "",
				foundCity: "",
				etabsEmpty: false,
				locationFailed: false,
				etabs: [],
				isLoading: false,
				etabUrl: "",
				etabCas: "",
				displayCas: "",
				etabName: "",
				ents: [],
				retries: 0,
				etabsFetching: false,
				permissionDeny: false,
				permissionWait: true
			}
		},
	});
</script>

<template>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-back-button class="only-ios" text="Retour"></ion-back-button>
				<ion-back-button class="only-md"></ion-back-button>
			</ion-buttons>
			<ion-title>Connexion à Pronote</ion-title>
			<ion-buttons slot="end" style="padding-right: 10px;">
				<ion-spinner v-if="isLoading"></ion-spinner>
			</ion-buttons>
		</ion-toolbar>
		<ion-toolbar>
			<ion-searchbar autocomplete="off" ref="postalInput" placeholder="Chercher avec un code postal..." type="number" @ionInput="getPostal($event)" @ionClear="clearEtabs()" maxlength="5"></ion-searchbar>
		</ion-toolbar>
	</ion-header>

	<ion-content :fullscreen="true">

		<ion-list>
			<ion-list-header>
				<ion-label>
					<p>Établissements disponibles</p>
				</ion-label>
			</ion-list-header>

			<ion-item button detail="true" v-for="(etab, index) in etabs" v-bind:key="index" @click="loginToEtab(etab.url, etab.cp)">
				<ion-icon class="icon" slot="start" :ios="schoolOutline" :md="schoolSharp"></ion-icon>
				<ion-label>
					<h2>{{ etab.nomEtab }}</h2>
					<p>{{ etab.url }}</p>
				</ion-label>
			</ion-item>

			<ion-item v-if="permissionWait">
				<ion-icon class="icon" slot="start" :ios="businessOutline" :md="businessSharp"></ion-icon>
				<ion-label>
					<h2>En attente de la permission...</h2>
					<p>Veuillez autoriser la permission de géolocalisation pour rechercher les établissements à proximité.</p>
				</ion-label>
			</ion-item>

			<ion-item v-if="etabsFetching">
				<ion-icon class="icon" slot="start" :ios="businessOutline" :md="businessSharp"></ion-icon>
				<ion-label>
					<h2>Recherche des établissements...</h2>
					<p></p>
				</ion-label>
			</ion-item>

			<ion-item v-if="etabsEmpty">
				<ion-icon class="icon" slot="start" :ios="businessOutline" :md="businessSharp"></ion-icon>
				<ion-label>
					<h2>Pas d'établissements par ici...</h2>
					<p>Essayez une autre vile ou un autre code postal</p>
				</ion-label>
			</ion-item>

			<ion-item v-if="locationFailed">
				<ion-icon class="icon" slot="start" :ios="navigateOutline" :md="navigateSharp"></ion-icon>
				<ion-label>
					<h2>Emplacement introuvable</h2>
					<p>Impossible de trouver des établissements à "{{ terms }}"</p>
				</ion-label>
			</ion-item>

			<ion-item v-if="permissionDeny">
				<ion-icon class="icon" slot="start" :ios="navigateOutline" :md="navigateSharp"></ion-icon>
				<ion-label>
					<h2>Permission "Géolocalisation" refusée</h2>
					<p>Nous ne pouvons pas chercher les établissements à proximité. Veuillez autoriser la géolocalisation et réessayez.</p>
				</ion-label>
			</ion-item>
		</ion-list>
		
		<ion-list>
			<ion-list-header>
				<ion-label>
					<p>Autres options</p>
				</ion-label>
			</ion-list-header>

			<ion-item button @click="URLLogin()">
				<ion-icon class="icon" slot="start" :ios="linkOutline" :md="linkSharp"></ion-icon>
				<ion-label>
					<h2>Se connecter avec une URL</h2>
					<p>Utilisez l'URL fournie par votre établissement</p>
				</ion-label>
			</ion-item>

			<ion-item button @click="loginToDemo()">
				<ion-icon class="icon" slot="start" :ios="personCircleOutline" :md="personCircleSharp"></ion-icon>
				<ion-label>
					<h2>Utiliser le compte démo</h2>
					<p>Permet de tester Papillon à l'aide du compte de démonstration</p>
				</ion-label>
			</ion-item>

			<ion-item button disabled>
				<ion-icon class="icon" slot="start" :ios="qrCodeOutline" :md="qrCodeSharp"></ion-icon>
				<ion-label>
					<h2>Se connecter avec un QR-Code</h2>
					<p>Scannez le QR-Code de l'interface Pronote</p>
				</ion-label>
			</ion-item>
		</ion-list>

		<ion-list>
			<ion-list-header>
				<ion-label>
					<p>Options avancées</p>
				</ion-label>
			</ion-list-header>

			<ion-item button @click="changeApi()">
				<ion-icon class="icon" slot="start" :ios="serverOutline" :md="serverSharp"></ion-icon>
				<ion-label>
					<h2>Changer d'API</h2>
					<p>Utiliser une autre API que celle de Papillon que vous hébergez vous-mêmes.</p>
				</ion-label>
			</ion-item>
		</ion-list>

		<br/><br/>

		<ion-modal ref="loginModal" trigger="open-loginModal" :swipeToClose="true">
			<ion-header>
				<ion-toolbar>
					<ion-title>Se connecter</ion-title>
					<ion-buttons slot="end">
					<ion-button @click="dismiss()">Fermer</ion-button>
					</ion-buttons>
				</ion-toolbar>
			</ion-header>
			<ion-content>
				<div class="loginPage">
					
					<div class="loginIntro">
						<img src="assets/welcome/pronote_logo.png" alt="Pronote Logo" class="logo"/>
						<div class="introData">
							<h2>Connexion à Papillon</h2>
							<p class="description">Vous souhaitez vous connecter à <B>Pronote</B> en utilisant <B>{{displayCas}}</B>.</p>
							<p v-if="isEduconnectLogin" class="isEduconnectLogin">Cet ENT utilise ÉduConnect, merci de rentrer les identifiants de ce service.</p>
						</div>
					</div>

					<ion-list class="loginInput">
						<ion-item mode="md" fill="solid" class="userIn">
							<ion-label position="floating">Identifiant</ion-label>
							<ion-input ref="user" type="text" placeholder="j.dupont6" autocomplete="username"></ion-input>
						</ion-item>

						<ion-item mode="md" fill="solid" class="passIn">
							<ion-label position="floating">Mot de passe</ion-label>
							<ion-input ref="pass" type="password" placeholder="*********"></ion-input>
						</ion-item>

						<ion-button class="loginBtn" @click="login" expand="block" mode="md">
							Se connecter
						</ion-button>
					</ion-list>

					<div class="loginConditions">
						Vos données ne sont pas stockées sur nos serveurs. En vous connectant avec cette application, vous acceptez les <a href="https://docs.getpapillon.xyz/documents/politique-de-confidentialite-et-mentions-legales">conditions d'utilisation</a> de Papillon.
					</div>

				</div>
			</ion-content>
		</ion-modal> 

	</ion-content>
</template>
  
<style scoped>
	.ios .icon {
		opacity: 50%;
	}

	.loginIntro {
		background: var(--ion-color-step-50);
		margin: 20px;
		border-radius: 10px;

		display: flex;
		flex-direction: row;
		align-items: center;

		padding: 20px;
		gap: 20px;
	}

	.loginIntro * {
		margin: 0;
	}

	.loginIntro .logo {
		height: 44px;
	}

	.loginIntro .introData {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.loginIntro .introData h2 {
		font-size: 18px;
	}

	.loginIntro .introData .description {
		font-size: 15px;
		opacity: 0.7;
	}

	.loginIntro .isEduconnectLogin {
		font-size: 15px;
		opacity: 0.5;
		margin-top: 10px;
	}

	.loginInput {
		margin: 0px 20px;
	}

	.loginBtn {
		margin-top: 20px;
		--border-radius: 8px !important;
	}

	.loginInput ion-item {
		margin-bottom: 10px;
	}

	.loginInput ion-item::part(native) {
		--border-color: var(--ion-color-step-200) !important;
		--border-top-left-radius: 8px !important;
		--border-top-right-radius: 8px !important;
	}

	.loginConditions {
		margin: 20px;
		font-size: 12px;
		opacity: 0.5;
		text-align: center;
	}
</style>
