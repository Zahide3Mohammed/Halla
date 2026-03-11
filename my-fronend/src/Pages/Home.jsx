import Cards from "../Composants/pageHome/Card";
import Faq from "../Composants/pageHome/Faq";
import PremiumHome from "../Composants/pageHome/Hero";
import Footer from "../Elementes/footer";
import Header from "../Elementes/header";



export default function Home(){
    return<>
    <PremiumHome />
    <Cards />
    <Faq />
    <Footer />
    </>

}