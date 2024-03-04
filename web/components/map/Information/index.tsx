import { defineComponent, onMounted, ref } from "vue";
import { useMapData } from "~/utils";
import IcArrowLeft from "~/assets/icons/ic-arrow-left.svg";
import MapMarkdownRenderer from "~/components/map/MarkdownRenderer.vue";
import MapAttachmentLink from "~/components/map/AttachmentLink.vue";

export default defineComponent({
  setup() {
    const isLoading = ref(true);
    const data = ref<MapData | null>(null);
    const featureStore = useFeature();

    onMounted(async () => {
      const mapData = await useMapData();
      isLoading.value = mapData.isLoading.value;
      data.value = mapData.data.value;
    });

    return {
      isLoading,
      data,
      featureStore,
    };
  },

  render() {
    return (
      <div>
        <div class='flex justify-between items-center m-3'>
          <h2 class='text-white'>Map Information</h2>
          <IcArrowLeft
            // @ts-ignore
            role='button'
            onClick={() => this.featureStore.setRightSidebar("")}
            fontControlled={false}
            class='w-3 h-3 rotate-180 text-grey-50'
          />
        </div>
        <hr class='mx-3' />
        <div class='flex-1 overflow-scroll px-3 my-3'>
          {this.isLoading ? (
            <div class='px-3 my-3 text-white'>Loading ...</div>
          ) : (
            <MapMarkdownRenderer source={this.data?.data.information} />
          )}
          {this.data?.data.information_attachments?.length ? (
            <ul class='mt-3 space-y-3'>
              {this.data.data.information_attachments.map((attachment) => (
                <MapAttachmentLink
                  title={attachment.title}
                  description={attachment.description}
                  url={attachment.url}
                  icon={attachment.icon}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    );
  },
});
