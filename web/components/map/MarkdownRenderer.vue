<template>
    <article v-html="markdown.render(source)" class="prose prose-sm prose-headings:text-white prose-p:text-grey-400 prose-a:text-grey-300 prose-strong:text-grey-200"></article>
</template>
  
<script setup lang="ts">
  import MarkdownIt from "markdown-it";
//   import MarkdownItAbbr from "markdown-it-abbr";
//   import MarkdownItAnchor from "markdown-it-anchor";
//   import MarkdownItFootnote from "markdown-it-footnote";
//   import MarkdownItHighlightjs from "markdown-it-highlightjs";
//   import MarkdownItSub from "markdown-it-sub";
//   import MarkdownItSup from "markdown-it-sup";
//   import MarkdownItTasklists from "markdown-it-task-lists";
//   import MarkdownItTOC from "markdown-it-toc-done-right";
  
  const markdown = new MarkdownIt()
    // .use(MarkdownItAbbr)
    // .use(MarkdownItAnchor)
    // .use(MarkdownItFootnote)
    // .use(MarkdownItHighlightjs)
    // .use(MarkdownItSub)
    // .use(MarkdownItSup)
    // .use(MarkdownItTasklists)
    // .use(MarkdownItTOC);
  
    const def=`
# Et aut tenuit medio manes

## Sua Iove excedam equinis serrae

Lorem markdownum egisse cinctum te sonuere modo [perque tamen
admonet](http://adest.org/), cum et Gorgoneis, ultor mihi omnia. Sculpsit per
Stygia, aspiciunt repleam carbasa vis indicat clade Insania bisulco; terra
novis; et. Ab si vidit.

    if (software_trackball) {
        pinterestThyristorDigitize += computer_bar + rpm;
    }
    model_error_tunneling += hard_css;
    vdu = swipe;
    var realMbrTape = copy_design;

Pennis et volumina senilem vulnere aquae et *ulla* porrigit calcavit amplexus
pietas *Iovis elisarum genua* non fas. Detrahis pius mea, **tu** ira est;
antiqua vita! Agro cernere placet pectus; vocisque pugnare dexteriore mandata
trabes.

## Gurgite nunc artibus

Hos femina, nec gelido, terris, nantemque tellus. Continet sectamque! Fac esset
tamen Capaneusque deperit ut **barba confiteor** Temesaea et foresque atros
increpat; pavet? Induiturque iniceret superis modo mitescere, tristia
prensamque: aquatica dicta, edax voce auctor turba frigida, fuge.

> Perveniunt rabies taedasque vulnere, enim pater et pauca pinus tutela; tamen
> conata nympharum. Et ducere coniugis lacrimis Caystro exspectatum rogari
> Clitorio distincta nec qualia, deserit huc! Metuit [quod nemus
> clamant](http://www.naiadum.org/longius): aure fecisti excussam *senior*
> numerare, adest aer **possint** fratrum utimur Tartessia tutus. Miserum
> inductas nunc infantemque senecta animi, magis deque? Sub te latrantes quae
> domo per paventem tendit, unco.

Vel tu secutum, in cultus dixit pompas **limine** iaculum hanc iubae capillis.
Mecum certior letifer Oenidae propior, anum **dabitis** non vocem stipite. Tecum
ergo lucis, et aethera ora et erat cubile sit, caligine.

    var smm_microcomputer_ethernet = 4;
    mtuSmartphoneMysql(editor, virtualizationDfs + tiffQuadDisk, -3);
    var wizard_webmaster = intelligence;

Chariclo **ambiguo ante nec**, nitidum *ire* orbem et domos plurima. Gradu
nautas, sit de *referebat pocula*. Per hinc est communis, nata vina considere
tertia, ut.`

  defineProps({
    source: {
      type: String,
      default: def
    }
  });
</script>